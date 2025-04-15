'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Divider, Select, Spin, Table, Tag, Modal, Form, Input, DatePicker, message, InputNumber, Radio } from 'antd';
import { SearchOutlined, FilterOutlined, CheckCircleOutlined, CloseCircleOutlined, GiftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// Define types for our data structures
interface Sport {
  _id: string;
  sportId: string;
  sportName: string;
  description?: string;
  categories?: string[];
}

interface Equipment {
  _id: string;
  equipmentId: string;
  name: string;
  sport: Sport | string;
  description?: string;
  quantity?: number;
}

interface RequestItem {
  equipment: Equipment | string;
  quantityRequested: number;
  quantityApproved?: number;
  notes?: string;
}

interface School {
  _id: string;
  schoolId: string;
  name: string;
  district?: string;
  address?: string;
}

interface EquipmentRequest {
  _id: string;
  requestId: string;
  school: School | string;
  eventName: string;
  eventStartDate?: string;
  eventEndDate?: string;
  eventDescription: string;
  requestLetterUrl?: string;
  items: RequestItem[];
  status: 'pending' | 'approved' | 'rejected' | 'partial' | 'delivered';
  additionalNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  processedBy?: string;
}

interface EquipmentRequestProps {
  governBodyId?: string;
  donorData?: any;
  specializedSports?: string[]; // Array of sport IDs that this governing body specializes in
}

const EquipmentRequestComponent: React.FC<EquipmentRequestProps> = ({ governBodyId, donorData, specializedSports }) => {
  const [requests, setRequests] = useState<EquipmentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<EquipmentRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [sports, setSports] = useState<Sport[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [searchText, setSearchText] = useState<string>('');

  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [responseVisible, setResponseVisible] = useState<boolean>(false);
  const [donateVisible, setDonateVisible] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<EquipmentRequest | null>(null);

  const [responseForm] = Form.useForm();
  const [donationForm] = Form.useForm();

  const [governBodySports, setGovernBodySports] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const sportsRes = await fetch('/api/sport');
        const sportsData = await sportsRes.json();
        setSports(sportsData.sports);

        const equipmentRes = await fetch('/api/equipment');
        const equipmentData = await equipmentRes.json();
        setEquipment(equipmentData.equipment);

        let sportIds = specializedSports || [];
        if (governBodyId && !specializedSports?.length) {
          const governBodyRes = await fetch(`/api/govern?id=${governBodyId}`);
          const governBodyData = await governBodyRes.json();
          if (governBodyData.sports && Array.isArray(governBodyData.sports)) {
            sportIds = governBodyData.sports.map((s: any) => s._id || s);
            setGovernBodySports(sportIds);
          }
        } else if (specializedSports?.length) {
          setGovernBodySports(specializedSports);
        }

        const requestsRes = await fetch('/api/equipment/request');
        const requestsData = await requestsRes.json();

        let filteredRequests = requestsData.equipmentRequests;

        if (sportIds.length > 0) {
          filteredRequests = requestsData.equipmentRequests.filter((req: EquipmentRequest) => {
            return req.items.some(item => {
              const equip = item.equipment as Equipment;
              const sport = equip.sport as Sport;
              return sportIds.includes(sport?._id) || sportIds.includes(sport?.sportId);
            });
          });

          filteredRequests = filteredRequests.map((req: EquipmentRequest) => {
            const relevantItems = req.items.filter(item => {
              const equip = item.equipment as Equipment;
              const sport = equip.sport as Sport;
              return sportIds.includes(sport?._id) || sportIds.includes(sport?.sportId);
            });
            return { ...req, items: relevantItems };
          });
        }

        setRequests(filteredRequests);
        setFilteredRequests(filteredRequests);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [governBodyId, specializedSports]);

  useEffect(() => {
    applyFilters();
  }, [selectedStatus, selectedSport, dateRange, searchText, requests]);

  const applyFilters = () => {
    let filtered = [...requests];

    if (selectedStatus) {
      filtered = filtered.filter(req => req.status === selectedStatus);
    }

    if (selectedSport) {
      filtered = filtered.filter(req =>
        req.items.some(item => {
          const equip = item.equipment as Equipment;
          const sport = equip.sport as Sport;
          return sport?._id === selectedSport || sport?.sportId === selectedSport;
        })
      );
    }

    if (dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day').toISOString();
      const endDate = dateRange[1].endOf('day').toISOString();
      filtered = filtered.filter(req => {
        if (!req.eventStartDate) return true;
        const requestDate = new Date(req.eventStartDate).toISOString();
        return requestDate >= startDate && requestDate <= endDate;
      });
    }

    if (searchText.trim()) {
      const query = searchText.toLowerCase().trim();
      filtered = filtered.filter(req => {
        const school = req.school as School;
        return (
          req.eventName.toLowerCase().includes(query) ||
          school?.name.toLowerCase().includes(query) ||
          req.requestId.toLowerCase().includes(query)
        );
      });
    }

    setFilteredRequests(filtered);
  };

  const handleViewDetails = (request: EquipmentRequest) => {
    setSelectedRequest(request);
    setDetailVisible(true);
  };

  const handleRespond = (request: EquipmentRequest) => {
    setSelectedRequest(request);

    const initialValues = {
      status: 'approved',
      items: request.items.map(item => ({
        equipmentId: (item.equipment as Equipment)._id,
        quantityRequested: item.quantityRequested,
        quantityApproved: item.quantityRequested,
      }))
    };

    responseForm.setFieldsValue(initialValues);
    setResponseVisible(true);
  };

  const handleDonate = (request: EquipmentRequest) => {
    setSelectedRequest(request);

    const initialValues = {
      donationType: 'EQUIPMENT',
      donor: donorData?.id,
      recipient: (request.school as School)._id,
      anonymous: false,
      items: request.items.map(item => ({
        itemName: (item.equipment as Equipment).name,
        quantity: item.quantityRequested,
        condition: 'good',
      }))
    };

    donationForm.setFieldsValue(initialValues);
    setDonateVisible(true);
  };

  const handleResponseSubmit = async (values: any) => {
    try {
      console.log("Form values:", values);

      if (values.status === 'approved' && !governBodyId) {
        message.error('Missing governing body ID. Cannot create transaction.');
        return;
      }

      // Check if status is set
      if (!values.status) {
        message.error('Please select a status for the request');
        return;
      }

      // Get the existing request for item references
      const existingRequest = selectedRequest;
      if (!existingRequest) {
        message.error('Request data missing');
        return;
      }

      // Prepare base response data for the equipment request
      const responseData: any = {
        status: values.status,
        additionalNotes: values.notes || undefined,
        processedBy: donorData?.name || 'System',
        processedAt: new Date().toISOString()
      };

      // Add rejection reason only if status is rejected
      if (values.status === 'rejected') {
        if (!values.rejectionReason) {
          message.error('Rejection reason is required when rejecting a request');
          return;
        }
        responseData.rejectionReason = values.rejectionReason;
      } else if (values.status === 'approved') {
        // Update quantities approved for each item if status is approved
        if (values.items && values.items.length > 0) {
          const updatedItems = existingRequest.items.map((item: RequestItem, index: number) => {
            const formItem = values.items.find((i: any) => 
              (item.equipment as Equipment)._id === i.equipmentId);
            
            if (formItem) {
              return {
                ...item,
                quantityApproved: formItem.quantityApproved
              };
            }
            return item;
          });
          responseData.items = updatedItems;
        }
      }
      
      console.log("Sending response data:", responseData);
      
      // Send update to API
      const response = await fetch(`/api/equipment/request?id=${existingRequest.requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update request');
      }
      
      const updatedRequest = await response.json();
      
      // If approved, create a transaction
      if (values.status === 'approved') {
        try {
          console.log("governBodyId type:", typeof governBodyId, "value:", governBodyId);
          
          // First fetch the governing body to get its MongoDB _id
          const governBodyResponse = await fetch(`/api/govern?id=${governBodyId}`);
          
          if (!governBodyResponse.ok) {
            throw new Error(`Failed to fetch govern body details: ${governBodyId}`);
          }
          
          const governBodyData = await governBodyResponse.json();
          
          if (!governBodyData || !governBodyData._id) {
            throw new Error('Could not retrieve governing body ID');
          }

          // Create transaction for the approved equipment
          const transactionData = {
            providerType: 'governBody',  // Changed from 'GovernBody' to 'governBody'
            provider: String(governBodyData._id),
            recipient: String((existingRequest.school as School)._id),
            transactionType: values.transactionType || 'permanent',
            items: values.items
              .filter((item: any) => item.quantityApproved > 0)
              .map((item: any) => {
                // Find the original item from the request to get the equipment reference
                const originalItem = existingRequest.items.find((reqItem: any) => 
                  (reqItem.equipment as Equipment)._id === item.equipmentId);
                  
                if (!originalItem) {
                  console.error(`Could not find matching original item for ${item.equipmentId}`);
                  return null;
                }
                  
                return {
                  equipment: item.equipmentId,
                  quantity: item.quantityApproved,
                  condition: 'good',
                  notes: originalItem.notes || `From request ${existingRequest.requestId}`
                };
              })
              .filter(Boolean), // Remove any null items
            status: 'approved',
            additionalNotes: `Created from equipment request ${existingRequest.requestId}`,
            termsAndConditions: 'Standard equipment loan terms apply',
            ...(values.transactionType === 'rental' && values.rentalDates ? {
              rentalDetails: {
                startDate: values.rentalDates[0].toISOString(),
                returnDueDate: values.rentalDates[1].toISOString(),
                rentalFee: values.rentalFee || 0
              }
            } : {})
          };

          // Before sending the transaction request
          console.log("Transaction data to send:", JSON.stringify(transactionData, null, 2));

          // Create the transaction
          const transactionResponse = await fetch('/api/equipment/transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData)
          });

          // Get the detailed error message
          if (!transactionResponse.ok) {
            const transactionError = await transactionResponse.json();
            console.error("Transaction error details:", transactionError);
            message.warning(`Request approved but transaction creation failed: ${transactionError.error || JSON.stringify(transactionError)}`);
          } else {
            const transaction = await transactionResponse.json();
            message.success(`Transaction ${transaction.transactionId} created successfully`);
          }
        } catch (transactionError) {
          console.error('Error creating transaction:', transactionError);
          message.warning('Request approved but transaction creation failed');
        }
      }
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.requestId === updatedRequest.requestId ? updatedRequest : req
      ));
      setFilteredRequests(prev => prev.map(req => 
        req.requestId === updatedRequest.requestId ? updatedRequest : req
      ));
      
      message.success(`Request ${values.status === 'approved' ? 'approved' : values.status === 'rejected' ? 'rejected' : 'updated'} successfully`);
      
      // Close modal and reset form
      setResponseVisible(false);
      responseForm.resetFields();
    } catch (err) {
      console.error('Error updating request:', err);
      message.error(`Failed to update request: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDonationSubmit = async (values: any) => {
    try {
      const donationData = {
        donationType: 'EQUIPMENT',
        donor: values.donor,
        recipient: values.recipient,
        campaign: values.campaign,
        purpose: `Equipment for event: ${selectedRequest?.eventName}`,
        anonymous: values.anonymous,
        status: 'pending',
        itemDetails: values.items.map((item: any) => ({
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity,
          condition: item.condition,
          estimatedValue: item.estimatedValue
        })),
        notes: `Donation for equipment request ${selectedRequest?.requestId}`
      };

      const response = await fetch('/api/donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData)
      });

      if (!response.ok) {
        throw new Error('Failed to create donation');
      }

      const result = await response.json();
      message.success(`Donation created successfully with ID: ${result.donationId}`);
      setDonateVisible(false);
      donationForm.resetFields();

      if (selectedRequest) {
        const updateResponse = await fetch(`/api/equipment/request?id=${selectedRequest.requestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            additionalNotes: `Donation initiated with ID: ${result.donationId}`,
            status: 'approved'
          })
        });

        if (updateResponse.ok) {
          const updatedRequest = await updateResponse.json();
          setRequests(prev => prev.map(req =>
            req.requestId === updatedRequest.requestId ? updatedRequest : req
          ));
        }
      }
    } catch (err) {
      console.error('Error creating donation:', err);
      message.error('Failed to create donation. Please try again.');
    }
  };

  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'requestId',
      key: 'requestId',
      render: (text: string) => <span className="font-medium">{text}</span>
    },
    {
      title: 'School',
      dataIndex: 'school',
      key: 'school',
      render: (school: School | string) => {
        if (typeof school === 'object') {
          return <span>{school.name}</span>;
        }
        return <span>Loading...</span>;
      }
    },
    {
      title: 'Event Name',
      dataIndex: 'eventName',
      key: 'eventName',
    },
    {
      title: 'Event Date',
      dataIndex: 'eventStartDate',
      key: 'eventStartDate',
      render: (date: string) => date ? dayjs(date).format('MMM D, YYYY') : 'Not specified'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = '';
        switch (status) {
          case 'pending': color = 'gold'; break;
          case 'approved': color = 'green'; break;
          case 'rejected': color = 'red'; break;
          case 'partial': color = 'blue'; break;
          case 'delivered': color = 'purple'; break;
          default: color = 'default';
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Requested Items',
      key: 'items',
      render: (text: string, record: EquipmentRequest) => (
        <span>{record.items.length} relevant item(s)</span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: EquipmentRequest) => (
        <div className="space-x-2">
          <Button size="small" onClick={() => handleViewDetails(record)}>
            Details
          </Button>
          {record.status === 'pending' && (
            <>
              <Button size="small" type="primary" onClick={() => handleRespond(record)}>
                Respond
              </Button>
              <Button 
                size="small" 
                type="primary" 
                icon={<GiftOutlined />} 
                onClick={() => handleDonate(record)}
              >
                Donate
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  if (loading && !requests.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Button type="primary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Equipment Requests</h2>
      
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input 
              placeholder="Search by event, school, or ID" 
              prefix={<SearchOutlined />} 
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
              allowClear
            />
          </div>
          <div>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              allowClear
              onChange={(value: 'pending' | 'approved' | 'rejected' | 'partial' | 'delivered' | null) => setSelectedStatus(value)}
            >
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="partial">Partial</Option>
              <Option value="delivered">Delivered</Option>
            </Select>
          </div>
          <div>
            <Select
              placeholder="Filter by sport"
              style={{ width: '100%' }}
              allowClear
              onChange={(value: string | null) => setSelectedSport(value)}
            >
              {sports.map((sport: Sport) => (
                <Option key={sport._id} value={sport._id}>{sport.sportName}</Option>
              ))}
            </Select>
          </div>
          <div>
            <RangePicker 
              style={{ width: '100%' }} 
              onChange={(dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])} 
              placeholder={['Event start date', 'Event end date']}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table 
          dataSource={filteredRequests} 
          columns={columns} 
          rowKey="requestId" 
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No equipment requests found' }}
        />
      </div>
      
      <Modal
        title={`Equipment Request: ${selectedRequest?.requestId}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            Close
          </Button>,
          selectedRequest?.status === 'pending' && (
            <Button 
              key="respond" 
              type="primary" 
              onClick={() => {
                setDetailVisible(false);
                handleRespond(selectedRequest);
              }}
            >
              Respond to Request
            </Button>
          ),
          selectedRequest?.status === 'pending' && (
            <Button 
              key="donate" 
              type="primary" 
              icon={<GiftOutlined />}
              onClick={() => {
                setDetailVisible(false);
                handleDonate(selectedRequest);
              }}
            >
              Donate Equipment
            </Button>
          )
        ].filter(Boolean)}
        width={800}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-500">School</h3>
                <p>{(selectedRequest.school as School)?.name}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Status</h3>
                <p>
                  <Tag color={
                    selectedRequest.status === 'pending' ? 'gold' :
                    selectedRequest.status === 'approved' ? 'green' :
                    selectedRequest.status === 'rejected' ? 'red' :
                    selectedRequest.status === 'partial' ? 'blue' :
                    selectedRequest.status === 'delivered' ? 'purple' : 'default'
                  }>
                    {selectedRequest.status.toUpperCase()}
                  </Tag>
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Event Name</h3>
                <p>{selectedRequest.eventName}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Event Date</h3>
                <p>{selectedRequest.eventStartDate ? dayjs(selectedRequest.eventStartDate).format('MMM D, YYYY') : 'Not specified'}</p>
              </div>
              {selectedRequest.eventEndDate && (
                <div>
                  <h3 className="font-medium text-gray-500">End Date</h3>
                  <p>{dayjs(selectedRequest.eventEndDate).format('MMM D, YYYY')}</p>
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-500">Request Date</h3>
                <p>{dayjs(selectedRequest.createdAt).format('MMM D, YYYY')}</p>
              </div>
            </div>
            
            <Divider />
            
            <div>
              <h3 className="font-medium text-gray-500 mb-2">Relevant Requested Items</h3>
              <p className="text-sm text-blue-600 mb-2">
                Showing only equipment items related to this governing body's specialized sports.
              </p>
              <Table 
                dataSource={selectedRequest.items} 
                rowKey={(record: RequestItem, index: number | undefined): string => index !== undefined ? index.toString() : '0'}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Equipment',
                    dataIndex: 'equipment',
                    key: 'equipment',
                    render: (equip: Equipment | string): React.ReactNode => {
                      if (typeof equip === 'object') {
                        return <span>{equip.name}</span>;
                      }
                      return <span>Loading...</span>;
                    }
                  },
                  {
                    title: 'Quantity Requested',
                    dataIndex: 'quantityRequested',
                    key: 'quantityRequested',
                  },
                  {
                    title: 'Quantity Approved',
                    dataIndex: 'quantityApproved',
                    key: 'quantityApproved',
                    render: (qty: number) => qty !== undefined ? qty : '-'
                  },
                  {
                    title: 'Notes',
                    dataIndex: 'notes',
                    key: 'notes',
                    render: (notes: string) => notes || '-'
                  }
                ]}
              />
            </div>
            
            {selectedRequest.additionalNotes && (
              <div>
                <Divider />
                <h3 className="font-medium text-gray-500">Additional Notes</h3>
                <p>{selectedRequest.additionalNotes}</p>
              </div>
            )}
            
            {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
              <div>
                <Divider />
                <h3 className="font-medium text-gray-500 text-red-500">Rejection Reason</h3>
                <p className="text-red-500">{selectedRequest.rejectionReason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
      
      <Modal
        title="Respond to Equipment Request"
        open={responseVisible}
        onCancel={() => setResponseVisible(false)}
        footer={null}
      >
        <Form
          form={responseForm}
          layout="vertical"
          onFinish={handleResponseSubmit}
        >
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select>
              <Option value="approved">Approve</Option>
              <Option value="rejected">Reject</Option>
              <Option value="partial">Partially Approve</Option>
            </Select>
          </Form.Item>
          
          {/* Show different fields based on selected status */}
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.status !== currentValues.status
            }
          >
            {({ getFieldValue }) => {
              const status = getFieldValue('status');
              
              if (status === 'rejected') {
                return (
                  <Form.Item
                    name="rejectionReason"
                    label="Rejection Reason"
                    rules={[{ required: true, message: 'Please provide a reason for rejection' }]}
                  >
                    <TextArea rows={4} />
                  </Form.Item>
                );
              }
              
              if (status === 'approved' || status === 'partial') {
                return (
                  <>
                    {/* Items list with approved quantities */}
                    <div className="mb-4">
                      <h3 className="text-lg font-medium">Equipment Items</h3>
                      <Form.List name="items">
                        {(fields) => (
                          <div className="space-y-3">
                            {fields.map(field => {
                              const item = selectedRequest?.items[field.name];
                              const equipment = item?.equipment as Equipment;
                              
                              return (
                                <div key={field.key} className="flex items-center space-x-4 p-2 border rounded">
                                  <div className="flex-1">
                                    <div className="font-medium">{equipment?.name}</div>
                                    <div className="text-sm text-gray-500">Requested: {item?.quantityRequested}</div>
                                    <Form.Item
                                      name={[field.name, 'equipmentId']}
                                      hidden
                                    >
                                      <Input />
                                    </Form.Item>
                                  </div>
                                  <Form.Item
                                    name={[field.name, 'quantityApproved']}
                                    label="Approve"
                                    rules={[
                                      { required: true, message: 'Required' },
                                      { 
                                        type: 'number', 
                                        min: 0, 
                                        max: item?.quantityRequested,
                                        message: `Must be between 0-${item?.quantityRequested}` 
                                      }
                                    ]}
                                  >
                                    <InputNumber min={0} max={item?.quantityRequested} />
                                  </Form.Item>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </Form.List>
                    </div>
                    
                    {/* Transaction details */}
                    <Divider>Transaction Details</Divider>
                    
                    <Form.Item
                      name="transactionType"
                      label="Transaction Type"
                      initialValue="permanent"
                    >
                      <Radio.Group>
                        <Radio value="permanent">Permanent Transfer</Radio>
                        <Radio value="rental">Rental</Radio>
                      </Radio.Group>
                    </Form.Item>
                    
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) => 
                        prevValues.transactionType !== currentValues.transactionType
                      }
                    >
                      {({ getFieldValue }) => {
                        const transactionType = getFieldValue('transactionType');
                        
                        if (transactionType === 'rental') {
                          return (
                            <>
                              <Form.Item
                                name="rentalDates"
                                label="Rental Period"
                                rules={[{ required: true, message: 'Please select rental period' }]}
                              >
                                <RangePicker />
                              </Form.Item>
                              <Form.Item
                                name="rentalFee"
                                label="Rental Fee (optional)"
                              >
                                <InputNumber
                                  min={0}
                                  precision={2}
                                  addonBefore="$"
                                />
                              </Form.Item>
                            </>
                          );
                        }
                        return null;
                      }}
                    </Form.Item>
                  </>
                );
              }
              
              return null;
            }}
          </Form.Item>
          
          <Form.Item name="notes" label="Additional Notes">
            <TextArea rows={4} />
          </Form.Item>
          
          <Form.Item>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setResponseVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
      
      <Modal
        title="Donate Equipment"
        open={donateVisible}
        onCancel={() => setDonateVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={donationForm}
          layout="vertical"
          onFinish={handleDonationSubmit}
        >
          <Form.Item name="donor" hidden><Input /></Form.Item>
          <Form.Item name="recipient" hidden><Input /></Form.Item>
          <Form.Item name="donationType" hidden><Input /></Form.Item>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-500">From</p>
              <p className="font-medium">{donorData?.name}</p>
            </div>
            <div>
              <p className="text-gray-500">To School</p>
              <p className="font-medium">{(selectedRequest?.school as School)?.name}</p>
            </div>
          </div>
          
          <Form.Item
            name="campaign"
            label="Campaign Name (Optional)"
          >
            <Input placeholder="e.g. Sports Equipment Drive 2025" />
          </Form.Item>
          
          <Form.Item
            name="anonymous"
            valuePropName="checked"
          >
            <input type="checkbox" className="mr-2" id="anonymous" />
            <label htmlFor="anonymous">Make this donation anonymous</label>
          </Form.Item>
          
          <Divider />
          
          <h3 className="font-medium mb-4">Donation Items</h3>
          
          <Form.List name="items">
            {(fields: { key: number; name: number; fieldKey?: number }[], { add, remove }: { add: (defaultValue?: any, insertIndex?: number) => void; remove: (index: number | number[]) => void }) => (
              <div>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} className="mb-3" size="small">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Form.Item
                        {...restField}
                        name={[name, 'itemName']}
                        label="Item Name"
                        rules={[{ required: true, message: 'Please enter item name' }]}
                      >
                        <Input />
                      </Form.Item>
                      
                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        label="Quantity"
                        rules={[{ required: true, message: 'Please enter quantity' }]}
                      >
                        <InputNumber min={1} style={{ width: '100%' }} />
                      </Form.Item>
                      
                      <Form.Item
                        {...restField}
                        name={[name, 'condition']}
                        label="Condition"
                      >
                        <Select>
                          <Option value="new">New</Option>
                          <Option value="excellent">Excellent</Option>
                          <Option value="good">Good</Option>
                          <Option value="fair">Fair</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        {...restField}
                        name={[name, 'estimatedValue']}
                        label="Estimated Value (Optional)"
                      >
                        <InputNumber
                          min={0}
                          style={{ width: '100%' }}
                          prefix="LKR"
                        />
                      </Form.Item>
                      
                      <Form.Item
                        {...restField}
                        name={[name, 'description']}
                        label="Description (Optional)"
                        className="md:col-span-2"
                      >
                        <TextArea rows={2} />
                      </Form.Item>
                    </div>
                  </Card>
                ))}
                <Button 
                  type="dashed" 
                  onClick={() => add({ condition: 'good' })} 
                  block
                >
                  + Add Item
                </Button>
              </div>
            )}
          </Form.List>
          
          <div className="mt-6 flex justify-end space-x-2">
            <Button onClick={() => setDonateVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Create Donation
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default EquipmentRequestComponent;