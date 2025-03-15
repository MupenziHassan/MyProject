// ...existing code...

              {newRecord.vital === 'blood_pressure' ? (
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="systolic">Systolic (mm Hg)</label>
                    <input
                      type="number"
                      id="systolic"
                      name="systolic"
                      value={newRecord.systolic}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                      min="70"
                      max="220"
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="diastolic">Diastolic (mm Hg)</label>
                    <input
                      type="number"
                      id="diastolic"
                      name="diastolic"
                      value={newRecord.diastolic}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                      min="40"
                      max="120"
                    />
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="value">{getVitalLabel(newRecord.vital)}</label>
                  <input
                    type="number"
                    id="value"
                    name="value"
                    value={newRecord.value}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                    step={newRecord.vital === 'temperature' ? '0.1' : '1'}
                    min={
                      newRecord.vital === 'heart_rate' ? '40' :
                      newRecord.vital === 'temperature' ? '95' :
                      newRecord.vital === 'oxygen_level' ? '80' : '30'
                    }
                    max={
                      newRecord.vital === 'heart_rate' ? '220' :
                      newRecord.vital === 'temperature' ? '108' :
                      newRecord.vital === 'oxygen_level' ? '100' : '250'
                    }
                  />
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={newRecord.notes}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="2"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setAddingRecord(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Vitals history table - only on larger screens */}
      {!isMobile && (
        <div className="vitals-history">
          <h3>Recent History</h3>
          <table className="vitals-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Measurement</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {vitalsData[selectedVital] && vitalsData[selectedVital].slice(-5).map((record, index) => (
                <tr key={index}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>
                    {selectedVital === 'blood_pressure' 
                      ? `${record.values.systolic}/${record.values.diastolic} mmHg`
                      : `${record.value} ${
                          selectedVital === 'heart_rate' ? 'BPM' :
                          selectedVital === 'temperature' ? '°F' :
                          selectedVital === 'oxygen_level' ? '%' :
                          selectedVital === 'weight' ? 'kg' : ''
                        }`
                    }
                  </td>
                  <td>{record.notes || 'No notes'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="view-all-link">
            <a href="/patient/vitals/history">View Complete History</a>
          </div>
        </div>
      )}
    </div>
  );
};

// Prepare chart data based on selected vital
const prepareChartData = () => {
  // Handle case when vitalsData isn't loaded or doesn't contain the selected vital
  if (!vitalsData || !vitalsData[selectedVital] || vitalsData[selectedVital].length === 0) {
    return {
      labels: [],
      datasets: [{
        label: getVitalLabel(selectedVital),
        data: [],
        borderColor: getVitalColor(selectedVital),
        backgroundColor: getVitalColor(selectedVital, 0.5),
      }]
    };
  }

  if (selectedVital === 'blood_pressure') {
    return {
      labels: vitalsData.blood_pressure.map(bp => new Date(bp.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Systolic',
          data: vitalsData.blood_pressure.map(bp => bp.values && bp.values.systolic ? bp.values.systolic : null),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Diastolic',
          data: vitalsData.blood_pressure.map(bp => bp.values && bp.values.diastolic ? bp.values.diastolic : null),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }
      ]
    };
  } else {
    return {
      labels: vitalsData[selectedVital].map(item => new Date(item.date).toLocaleDateString()),
      datasets: [
        {
          label: getVitalLabel(selectedVital),
          data: vitalsData[selectedVital].map(item => item.value),
          borderColor: getVitalColor(selectedVital),
          backgroundColor: getVitalColor(selectedVital, 0.5),
        }
      ]
    };
  }
};

// Get the latest reading of selected vital
const getLatestReading = () => {
  if (!vitalsData || !vitalsData[selectedVital] || vitalsData[selectedVital].length === 0) {
    return { value: 'No data', date: '' };
  }
  
  const latest = vitalsData[selectedVital][vitalsData[selectedVital].length - 1];
  
  if (selectedVital === 'blood_pressure' && latest.values) {
    return {
      value: `${latest.values.systolic || '?'}/${latest.values.diastolic || '?'} mmHg`,
      date: latest.date ? new Date(latest.date).toLocaleDateString() : 'Unknown date'
    };
  } else {
    let unit = '';
    switch (selectedVital) {
      case 'heart_rate': unit = 'BPM'; break;
      case 'temperature': unit = '°F'; break;
      case 'oxygen_level': unit = '%'; break;
      case 'weight': unit = 'kg'; break;
    }
    
    return {
      value: `${latest.value || '?'} ${unit}`,
      date: latest.date ? new Date(latest.date).toLocaleDateString() : 'Unknown date'
    };
  }
};

export default VitalsTracker;
