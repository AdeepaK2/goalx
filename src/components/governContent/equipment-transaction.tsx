'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Divider, Select, Spin, Table, Tag, Modal, Input, DatePicker, message } from 'antd';
import { SearchOutlined, FilterOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Link from 'next/link';

const { Option } = Select;
const { RangePicker } = DatePicker;

// Define interface for Equipment
interface Equipment {
  _id: string;
  equipmentId: string;
  name: string;
  description?: string;
}

// Define interface for School
interface School {
  _id: string;
  schoolId: string;
  name: string;
  district?: string;
}

// Define interface for Transaction Items
interface TransactionItem {
  equipment: Equipment;
  quantity: number;
  condition: string;
  notes?: string;
}

// Define interface for Transaction
interface Transaction {
  _id: string;
  transactionId: string;
  governBody: any;  // Reference to govern body
  school: School;
  transactionType: 'permanent' | 'rental';
  items: TransactionItem[];
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'returned';
  additionalNotes?: string;
  requestReference?: string;
  rentalDetails?: {
    startDate: string;
    returnDueDate: string;
    returnedDate?: string;
    rentalFee?: number;
  };
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: any;
}

interface TransactionProps {
  governBodyId?: string;
  donorData?: any;
}

const EquipmentTransaction: React.FC<TransactionProps> = ({ governBodyId, donorData }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [govBodyMongoId, setGovBodyMongoId] = useState<string | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    status: 'approved',
    transactionType: '',
    searchTerm: '',
    dateRange: [null, null] as [dayjs.Dayjs | null, dayjs.Dayjs | null]
  });

  useEffect(() => {
    if (governBodyId) {
      fetchGovernBodyMongoId(governBodyId);
    } else if (donorData?.donorId) {
      fetchGovernBodyMongoId(donorData.donorId);
    } else {
      fetchCurrentGovernBody();
    }
  }, [governBodyId, donorData]);

  // Fetch the MongoDB _id for the governing body using the governBodyId
  const fetchGovernBodyMongoId = async (id: string) => {
    try {
      console.log(`Fetching govern body with ID: ${id}`);
      
      setLoading(true);
      const response = await fetch(`/api/govern?id=${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch governing body data: ${response.statusText}`);
      }
      
      const govData = await response.json();
      console.log("Govern body data:", govData);
      
      if (govData && govData._id) {
        setGovBodyMongoId(govData._id);
      } else {
        throw new Error('Governing body data missing MongoDB ID');
      }
    } catch (err) {
      console.error("Error fetching governing body:", err);
      setError(err instanceof Error ? err.message : 'Failed to load governing body information');
      setLoading(false);
    }
  };

  // Add this function to get current governing body from auth
  const fetchCurrentGovernBody = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/govern/me');
      
      if (!response.ok) {
        throw new Error('Failed to fetch authenticated governing body');
      }
      
      const data = await response.json();
      console.log("Current govern body data:", data);
      
      if (data.success && data.governBody) {
        setGovBodyMongoId(data.governBody.id); // This is the MongoDB _id
        return;
      }
      
      throw new Error('No governing body found in authentication data');
    } catch (err) {
      console.error("Error fetching current governing body:", err);
      setError(err instanceof Error ? err.message : 'Authentication error');
      setLoading(false);
    }
  };

  // Fetch transactions after we have the MongoDB _id
  useEffect(() => {
    if (govBodyMongoId) {
      fetchTransactions();
    }
  }, [govBodyMongoId, pagination.page, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log(`Fetching transactions for govern body: ${govBodyMongoId}`);
      
      let url = `/api/equipment/transaction/govern?governBody=${govBodyMongoId}&page=${pagination.page}&limit=${pagination.limit}`;
      
      // Add filters to the URL
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.transactionType) url += `&transactionType=${filters.transactionType}`;
      
      // Add date range filters if set
      if (filters.dateRange[0] && filters.dateRange[1]) {
        const startDate = filters.dateRange[0].startOf('day').toISOString();
        const endDate = filters.dateRange[1].endOf('day').toISOString();
        
        if (filters.transactionType === 'rental') {
          url += `&startDateFrom=${startDate}&startDateTo=${endDate}`;
        } else {
          // For non-rental transactions, filter by creation date
          url += `&createdFrom=${startDate}&createdTo=${endDate}`;
        }
      }
      
      console.log(`Request URL: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error fetching transactions: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Transactions data:", data);
      
      // Set the transactions and update pagination
      setTransactions(data.transactions || []);
      setFilteredTransactions(data.transactions || []);
      setPagination({
        ...pagination,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 1
      });
      
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Apply client-side filtering for the search term
  useEffect(() => {
    if (filters.searchTerm && transactions.length > 0) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const filtered = transactions.filter(transaction => {
        return (
          transaction.transactionId.toLowerCase().includes(searchTerm) ||
          transaction.school.name.toLowerCase().includes(searchTerm) ||
          (transaction.requestReference && transaction.requestReference.toLowerCase().includes(searchTerm)) ||
          transaction.items.some(item => item.equipment.name.toLowerCase().includes(searchTerm))
        );
      });
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [filters.searchTerm, transactions]);

  const handlePageChange = (page: number) => {
    setPagination({
      ...pagination,
      page
    });
  };

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters({
      ...filters,
      [filterName]: value
    });
    // Reset to first page when filters change
    setPagination({
      ...pagination,
      page: 1
    });
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailModalVisible(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('MMM D, YYYY');
  };

  const getStatusTag = (status: string) => {
    let color = '';
    switch (status) {
      case 'pending': color = 'gold'; break;
      case 'approved': color = 'green'; break;
      case 'rejected': color = 'red'; break;
      case 'completed': color = 'blue'; break;
      case 'cancelled': color = 'orange'; break;
      case 'returned': color = 'purple'; break;
      default: color = 'default';
    }
    return <Tag color={color}>{status.toUpperCase()}</Tag>;
  };

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (text: string) => <span className="font-medium">{text}</span>
    },
    {
      title: 'School',
      dataIndex: 'school',
      key: 'school',
      render: (school: School) => <span>{school.name}</span>
    },
    {
      title: 'Type',
      dataIndex: 'transactionType',
      key: 'transactionType',
      render: (type: string) => (
        <Tag color={type === 'rental' ? 'blue' : 'green'}>
          {type.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: 'Items',
      key: 'items',
      render: (text: string, record: Transaction) => (
        <span>{record.items.length} item(s)</span>
      )
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: Transaction) => (
        <div className="space-x-2">
          <Button 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>
          
          {record.status === 'approved' && (
            <Button 
              size="small" 
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                message.info("Update functionality will be implemented soon");
              }}
            >
              Update
            </Button>
          )}
        </div>
      )
    }
  ];

  if (loading && !transactions.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Transactions</h3>
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={() => {
              setError(null);
              if (governBodyId) fetchGovernBodyMongoId(governBodyId);
            }} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 bg-gradient-to-r from-blue-800 to-blue-600 rounded-lg p-8 shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
          Equipment Transactions
        </h1>
        <p className="text-blue-100 text-xl mt-4 text-center max-w-2xl mx-auto">
          Track and manage equipment transactions with schools across Sri Lanka.
        </p>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input 
              placeholder="Search by ID, school, or equipment" 
              prefix={<SearchOutlined />} 
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              allowClear
            />
          </div>
          <div>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
            >
              <Option value="approved">Approved</Option>
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
              <Option value="returned">Returned</Option>
            </Select>
          </div>
          <div>
            <Select
              placeholder="Filter by type"
              style={{ width: '100%' }}
              value={filters.transactionType}
              onChange={(value) => handleFilterChange('transactionType', value)}
              allowClear
            >
              <Option value="permanent">Permanent</Option>
              <Option value="rental">Rental</Option>
            </Select>
          </div>
          <div>
            <RangePicker 
              style={{ width: '100%' }} 
              onChange={(dates) => handleFilterChange('dateRange', dates)}
              placeholder={['Start date', 'End date']}
            />
          </div>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table 
          dataSource={filteredTransactions} 
          columns={columns} 
          rowKey="_id" 
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: handlePageChange
          }}
          locale={{
            emptyText: 'No transactions found'
          }}
          loading={loading}
        />
      </div>
      
      {/* Transaction Detail Modal */}
      <Modal
        title={`Transaction: ${selectedTransaction?.transactionId}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-500">School</h3>
                <p>{selectedTransaction.school.name}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Transaction Type</h3>
                <p>
                  <Tag color={selectedTransaction.transactionType === 'rental' ? 'blue' : 'green'}>
                    {selectedTransaction.transactionType.toUpperCase()}
                  </Tag>
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Status</h3>
                <p>{getStatusTag(selectedTransaction.status)}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Created Date</h3>
                <p>{formatDate(selectedTransaction.createdAt)}</p>
              </div>
              
              {selectedTransaction.approvedAt && (
                <div>
                  <h3 className="font-medium text-gray-500">Approved Date</h3>
                  <p>{formatDate(selectedTransaction.approvedAt)}</p>
                </div>
              )}
              
              {selectedTransaction.approvedBy && (
                <div>
                  <h3 className="font-medium text-gray-500">Approved By</h3>
                  <p>{selectedTransaction.approvedBy.fullName || selectedTransaction.approvedBy}</p>
                </div>
              )}
              
              {selectedTransaction.requestReference && (
                <div>
                  <h3 className="font-medium text-gray-500">Related Request</h3>
                  <p>{selectedTransaction.requestReference}</p>
                </div>
              )}
            </div>
            
            {/* Rental details if applicable */}
            {selectedTransaction.transactionType === 'rental' && selectedTransaction.rentalDetails && (
              <>
                <Divider />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-500">Rental Start</h3>
                    <p>{formatDate(selectedTransaction.rentalDetails.startDate)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Return Due</h3>
                    <p>{formatDate(selectedTransaction.rentalDetails.returnDueDate)}</p>
                  </div>
                  {selectedTransaction.rentalDetails.returnedDate && (
                    <div>
                      <h3 className="font-medium text-gray-500">Returned Date</h3>
                      <p>{formatDate(selectedTransaction.rentalDetails.returnedDate)}</p>
                    </div>
                  )}
                  {selectedTransaction.rentalDetails.rentalFee !== undefined && (
                    <div>
                      <h3 className="font-medium text-gray-500">Rental Fee</h3>
                      <p>LKR {selectedTransaction.rentalDetails.rentalFee.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </>
            )}
            
            <Divider />
            
            <div>
              <h3 className="font-medium text-gray-500 mb-2">Equipment Items</h3>
              <Table 
                dataSource={selectedTransaction.items} 
                rowKey={(record, index) => `${record.equipment._id}-${index}`}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Equipment',
                    dataIndex: ['equipment', 'name'],
                    key: 'equipment',
                  },
                  {
                    title: 'Equipment ID',
                    dataIndex: ['equipment', 'equipmentId'],
                    key: 'equipmentId',
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    key: 'quantity',
                  },
                  {
                    title: 'Condition',
                    dataIndex: 'condition',
                    key: 'condition',
                    render: (condition: string) => (
                      <Tag color={
                        condition === 'new' ? 'green' :
                        condition === 'excellent' ? 'cyan' :
                        condition === 'good' ? 'blue' :
                        condition === 'fair' ? 'orange' :
                        'red'
                      }>
                        {condition.toUpperCase()}
                      </Tag>
                    )
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
            
            {selectedTransaction.additionalNotes && (
              <div>
                <Divider />
                <h3 className="font-medium text-gray-500">Additional Notes</h3>
                <p className="whitespace-pre-line">{selectedTransaction.additionalNotes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EquipmentTransaction;