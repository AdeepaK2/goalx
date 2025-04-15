import React, { useState } from 'react';

interface Transaction {
  id: string;
  equipmentName: string;
  type: 'check-in' | 'check-out';
  date: string;
  userId: string;
  status: 'pending' | 'completed' | 'cancelled';
}

const EquipmentTransaction: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '001',
      equipmentName: 'Laptop Dell XPS 15',
      type: 'check-out',
      date: '2025-04-10',
      userId: 'user123',
      status: 'completed',
    },
    {
      id: '002',
      equipmentName: 'Projector HD-300',
      type: 'check-out',
      date: '2025-04-12',
      userId: 'user456',
      status: 'pending',
    },
    {
      id: '003',
      equipmentName: 'Conference Room Mic',
      type: 'check-in',
      date: '2025-04-14',
      userId: 'user789',
      status: 'completed',
    },
  ]);

  const [filter, setFilter] = useState('all');

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.status === filter);

  const addNewTransaction = () => {
    const newTransaction: Transaction = {
      id: `00${transactions.length + 1}`,
      equipmentName: 'New Equipment',
      type: 'check-out',
      date: '2025-04-15',
      userId: 'user999',
      status: 'pending',
    };
    setTransactions([...transactions, newTransaction]);
  };

  return (
    <div className="equipment-transaction-container">
      <h1>Equipment Transaction Management</h1>
      
      <div className="filters">
        <span>Filter by status: </span>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button 
          onClick={addNewTransaction}
          className="add-btn"
        >
          Add New Transaction
        </button>
      </div>
      
      <table className="transaction-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Equipment</th>
            <th>Type</th>
            <th>Date</th>
            <th>User ID</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.id}</td>
              <td>{transaction.equipmentName}</td>
              <td>{transaction.type}</td>
              <td>{transaction.date}</td>
              <td>{transaction.userId}</td>
              <td>
                <span className={`status-badge status-${transaction.status}`}>
                  {transaction.status}
                </span>
              </td>
              <td>
                <button>View</button>
                <button>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .equipment-transaction-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .filters {
          margin: 20px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .add-btn {
          margin-left: auto;
          padding: 8px 16px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .transaction-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .transaction-table th, .transaction-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        
        .transaction-table tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        
        .transaction-table th {
          background-color: #f8f8f8;
        }
        
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        
        .status-completed {
          background-color: #dff0d8;
          color: #3c763d;
        }
        
        .status-pending {
          background-color: #fcf8e3;
          color: #8a6d3b;
        }
        
        .status-cancelled {
          background-color: #f2dede;
          color: #a94442;
        }
      `}</style>
    </div>
  );
};

export default EquipmentTransaction;