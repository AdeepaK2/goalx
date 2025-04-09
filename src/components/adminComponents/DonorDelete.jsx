import React from 'react';

const DonorDelete = ({ donor, onConfirm, onCancel }) => {
  return (
    <div className="donor-delete-modal">
      <h3>Delete Donor</h3>
      <p>Are you sure you want to delete {donor.name}? This action cannot be undone.</p>
      
      <div className="button-group">
        <button className="btn delete-btn" onClick={() => onConfirm(donor.id)}>
          Delete
        </button>
        <button className="btn cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DonorDelete;