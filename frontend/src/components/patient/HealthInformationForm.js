import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/forms.css';

const HealthInformationForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formType, setFormType] = useState('general');
  
  const [formData, setFormData] = useState({
    general: {
      height: '',
      weight: '',
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      bloodSugar: '',
      heartRate: '',
      bodyTemperature: '',
      oxygenSaturation: '',
      notes: ''
    },
    symptoms: {
      primarySymptom: '',
      secondarySymptoms: '',
      painLevel: '0',
      symptomDuration: '',
      symptomFrequency: 'occasional',
      triggeredBy: '',
      relievedBy: '',
      notes: ''
    },
    cancerRisk: {
      previousCancerDiagnosis: 'no',
      cancerType: '',
      diagnosisDate: '',
      familyCancerHistory: 'no',
      familyCancerTypes: '',
      smokingStatus: 'never',
      yearsSmoked: '',
      alcoholConsumption: 'none',
      sunExposure: 'low',
      radiationExposure: 'no',
      geneticTesting: 'no',
      geneticRiskFactors: '',
      notes: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [formType]: {
        ...formData[formType],
        [name]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      await axios.post(`/api/v1/patients/health-information/${formType}`, formData[formType]);
      
      setSuccess(true);
      setLoading(false);
      
      // Reset form after successful submission
      setTimeout(() => {
        if (formType === 'general') {
          navigate('/patient/dashboard');
        } else {
          setFormData({
            ...formData,
            [formType]: {
              ...Object.fromEntries(
                Object.keys(formData[formType]).map(key => [key, ''])
              ),
              painLevel: '0',
              symptomFrequency: 'occasional',
              previousCancerDiagnosis: 'no',
              familyCancerHistory: 'no',
              smokingStatus: 'never',
              alcoholConsumption: 'none',
              sunExposure: 'low',
              radiationExposure: 'no',
              geneticTesting: 'no',
            }
          });
          setSuccess(false);
        }
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit health information');
      setLoading(false);
    }
  };

  return (
    <div className="health-information-form">
      <div className="form-type-selector">
        <button 
          className={`type-btn ${formType === 'general' ? 'active' : ''}`} 
          onClick={() => setFormType('general')}
        >
          General Health Metrics
        </button>
        <button 
          className={`type-btn ${formType === 'symptoms' ? 'active' : ''}`} 
          onClick={() => setFormType('symptoms')}
        >
          Symptom Report
        </button>
        <button 
          className={`type-btn ${formType === 'cancerRisk' ? 'active' : ''}`} 
          onClick={() => setFormType('cancerRisk')}
        >
          Cancer Risk Factors
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Information submitted successfully!</div>}

      <form onSubmit={handleSubmit} className="data-form">
        {/* General Health Metrics Form */}
        {formType === 'general' && (
          <>
            <h3>General Health Metrics</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="height">Height (cm)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.general.height}
                  onChange={handleChange}
                  placeholder="Height in cm"
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="weight">Weight (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.general.weight}
                  onChange={handleChange}
                  placeholder="Weight in kg"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Blood Pressure (mmHg)</label>
              <div className="blood-pressure-inputs">
                <input
                  type="number"
                  name="bloodPressureSystolic"
                  placeholder="Systolic"
                  value={formData.general.bloodPressureSystolic}
                  onChange={handleChange}
                  min="0"
                  max="300"
                />
                <span>/</span>
                <input
                  type="number"
                  name="bloodPressureDiastolic"
                  placeholder="Diastolic"
                  value={formData.general.bloodPressureDiastolic}
                  onChange={handleChange}
                  min="0"
                  max="200"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bloodSugar">Blood Sugar (mg/dL)</label>
                <input
                  type="number"
                  id="bloodSugar"
                  name="bloodSugar"
                  value={formData.general.bloodSugar}
                  onChange={handleChange}
                  placeholder="Blood sugar level"
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="heartRate">Heart Rate (bpm)</label>
                <input
                  type="number"
                  id="heartRate"
                  name="heartRate"
                  value={formData.general.heartRate}
                  onChange={handleChange}
                  placeholder="Heart rate"
                  min="0"
                  max="300"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bodyTemperature">Body Temperature (°C)</label>
                <input
                  type="number"
                  id="bodyTemperature"
                  name="bodyTemperature"
                  value={formData.general.bodyTemperature}
                  onChange={handleChange}
                  placeholder="Temperature"
                  step="0.1"
                  min="30"
                  max="45"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="oxygenSaturation">Oxygen Saturation (%)</label>
                <input
                  type="number"
                  id="oxygenSaturation"
                  name="oxygenSaturation"
                  value={formData.general.oxygenSaturation}
                  onChange={handleChange}
                  placeholder="SpO2"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.general.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional information about your current health status"
              ></textarea>
            </div>
          </>
        )}

        {/* Symptom Report Form */}
        {formType === 'symptoms' && (
          <>
            <h3>Symptom Report</h3>
            <div className="form-group">
              <label htmlFor="primarySymptom">Main Symptom</label>
              <input
                type="text"
                id="primarySymptom"
                name="primarySymptom"
                value={formData.symptoms.primarySymptom}
                onChange={handleChange}
                placeholder="What is your main concern?"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="secondarySymptoms">Other Symptoms</label>
              <textarea
                id="secondarySymptoms"
                name="secondarySymptoms"
                value={formData.symptoms.secondarySymptoms}
                onChange={handleChange}
                rows="2"
                placeholder="Any other symptoms you are experiencing"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="painLevel">Pain Level (0-10)</label>
              <input
                type="range"
                id="painLevel"
                name="painLevel"
                value={formData.symptoms.painLevel}
                onChange={handleChange}
                min="0"
                max="10"
              />
              <div className="range-labels">
                <span>No Pain</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="symptomDuration">Duration</label>
                <input
                  type="text"
                  id="symptomDuration"
                  name="symptomDuration"
                  value={formData.symptoms.symptomDuration}
                  onChange={handleChange}
                  placeholder="e.g., 3 days, 2 weeks"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="symptomFrequency">Frequency</label>
                <select
                  id="symptomFrequency"
                  name="symptomFrequency"
                  value={formData.symptoms.symptomFrequency}
                  onChange={handleChange}
                >
                  <option value="constant">Constant</option>
                  <option value="intermittent">Intermittent</option>
                  <option value="occasional">Occasional</option>
                  <option value="rare">Rare</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="triggeredBy">What triggers or worsens it?</label>
                <input
                  type="text"
                  id="triggeredBy"
                  name="triggeredBy"
                  value={formData.symptoms.triggeredBy}
                  onChange={handleChange}
                  placeholder="e.g., movement, eating, stress"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="relievedBy">What relieves it?</label>
                <input
                  type="text"
                  id="relievedBy"
                  name="relievedBy"
                  value={formData.symptoms.relievedBy}
                  onChange={handleChange}
                  placeholder="e.g., rest, medication"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Additional Details</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.symptoms.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any other details about your symptoms"
              ></textarea>
            </div>
          </>
        )}

        {/* Cancer Risk Factors Form */}
        {formType === 'cancerRisk' && (
          <>
            <h3>Cancer Risk Factors</h3>
            <p className="form-info">This information helps your healthcare provider assess potential cancer risks and determine appropriate screening recommendations.</p>
            
            <div className="form-group">
              <label>Have you ever been diagnosed with cancer?</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="previousCancerDiagnosis" 
                    value="yes"
                    checked={formData.cancerRisk.previousCancerDiagnosis === 'yes'}
                    onChange={handleChange}
                  /> 
                  Yes
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="previousCancerDiagnosis" 
                    value="no" 
                    checked={formData.cancerRisk.previousCancerDiagnosis === 'no'}
                    onChange={handleChange}
                  /> 
                  No
                </label>
              </div>
            </div>
            
            {formData.cancerRisk.previousCancerDiagnosis === 'yes' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cancerType">Type of Cancer</label>
                  <input
                    type="text"
                    id="cancerType"
                    name="cancerType"
                    value={formData.cancerRisk.cancerType}
                    onChange={handleChange}
                    placeholder="e.g., Breast, Lung, Colon"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="diagnosisDate">Year of Diagnosis</label>
                  <input
                    type="text"
                    id="diagnosisDate"
                    name="diagnosisDate"
                    value={formData.cancerRisk.diagnosisDate}
                    onChange={handleChange}
                    placeholder="e.g., 2015"
                  />
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label>Do you have a family history of cancer?</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="familyCancerHistory" 
                    value="yes"
                    checked={formData.cancerRisk.familyCancerHistory === 'yes'}
                    onChange={handleChange}
                  /> 
                  Yes
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="familyCancerHistory" 
                    value="no" 
                    checked={formData.cancerRisk.familyCancerHistory === 'no'}
                    onChange={handleChange}
                  /> 
                  No
                </label>
              </div>
            </div>
            
            {formData.cancerRisk.familyCancerHistory === 'yes' && (
              <div className="form-group">
                <label htmlFor="familyCancerTypes">Please specify (type of cancer and relationship)</label>
                <textarea
                  id="familyCancerTypes"
                  name="familyCancerTypes"
                  value={formData.cancerRisk.familyCancerTypes}
                  onChange={handleChange}
                  rows="2"
                  placeholder="e.g., Mother: breast cancer at age 45, Grandfather: lung cancer"
                ></textarea>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="smokingStatus">Smoking Status</label>
              <select
                id="smokingStatus"
                name="smokingStatus"
                value={formData.cancerRisk.smokingStatus}
                onChange={handleChange}
              >
                <option value="never">Never smoked</option>
                <option value="former">Former smoker</option>
                <option value="current">Current smoker</option>
              </select>
            </div>
            
            {formData.cancerRisk.smokingStatus !== 'never' && (
              <div className="form-group">
                <label htmlFor="yearsSmoked">Years of smoking</label>
                <input
                  type="text"
                  id="yearsSmoked"
                  name="yearsSmoked"
                  value={formData.cancerRisk.yearsSmoked}
                  onChange={handleChange}
                  placeholder="e.g., 10 years"
                />
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="alcoholConsumption">Alcohol Consumption</label>
                <select
                  id="alcoholConsumption"
                  name="alcoholConsumption"
                  value={formData.cancerRisk.alcoholConsumption}
                  onChange={handleChange}
                >
                  <option value="none">None</option>
                  <option value="occasional">Occasional</option>
                  <option value="moderate">Moderate</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="sunExposure">Sun Exposure</label>
                <select
                  id="sunExposure"
                  name="sunExposure"
                  value={formData.cancerRisk.sunExposure}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Have you been exposed to radiation (beyond normal X-rays)?</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="radiationExposure" 
                    value="yes"
                    checked={formData.cancerRisk.radiationExposure === 'yes'}
                    onChange={handleChange}
                  /> 
                  Yes
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="radiationExposure" 
                    value="no" 
                    checked={formData.cancerRisk.radiationExposure === 'no'}
                    onChange={handleChange}
                  /> 
                  No
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label>Have you had genetic testing for cancer risk?</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="geneticTesting" 
                    value="yes"
                    checked={formData.cancerRisk.geneticTesting === 'yes'}
                    onChange={handleChange}
                  /> 
                  Yes
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="geneticTesting" 
                    value="no" 
                    checked={formData.cancerRisk.geneticTesting === 'no'}
                    onChange={handleChange}
                  /> 
                  No
                </label>
              </div>
            </div>
            
            {formData.cancerRisk.geneticTesting === 'yes' && (
              <div className="form-group">
                <label htmlFor="geneticRiskFactors">Results of genetic testing</label>
                <textarea
                  id="geneticRiskFactors"
                  name="geneticRiskFactors"
                  value={formData.cancerRisk.geneticRiskFactors}
                  onChange={handleChange}
                  rows="2"
                  placeholder="e.g., BRCA1 positive, Lynch syndrome"
                ></textarea>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="notes">Additional Information</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.cancerRisk.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any other information related to cancer risk factors"
              ></textarea>
            </div>
          </>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Information'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HealthInformationForm;
