// ...existing code...

<button 
  className="btn btn-primary"
  onClick={() => {
    if (confirmAction && confirmAction.action) {
      const status = 
        confirmAction.action === 'confirm' ? 'confirmed' :
        confirmAction.action === 'complete' ? 'completed' : 'cancelled';
      updateAppointmentStatus(confirmAction.id, status);
    }
  }}
>
  Yes, Proceed
</button>
</div>
</div>
</div>
)}
</div>
);
};

export default AppointmentCalendar;
