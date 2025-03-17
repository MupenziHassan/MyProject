// Component to show personalized next steps based on risk level
import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../utils/IconFallbacks';

const RiskActionPlan = ({ prediction }) => {
  // Different action plans based on risk level
  const getActionPlan = (prediction) => {
    const riskLevel = prediction.riskLevel.toLowerCase();
    
    if (riskLevel === 'low') {
      return {
        title: 'Maintain Your Health',
        description: 'Your risk is currently low. Here are some ways to maintain your good health:',
        steps: [
          { icon: 'FaAppleAlt', text: 'Continue eating a balanced diet rich in fruits and vegetables' },
          { icon: 'FaRunning', text: 'Maintain regular physical activity (150 minutes weekly)' },
          { icon: 'FaCalendarCheck', text: 'Schedule your next routine check-up in 12 months' }
        ],
        resources: [
          { title: 'Healthy Living Guide', link: '/resources/healthy-living' },
          { title: 'Nutrition Basics', link: '/resources/nutrition' }
        ]
      };
    } 
    
    if (riskLevel === 'moderate') {
      return {
        title: 'Take Preventive Action',
        description: 'Your moderate risk level suggests some areas for improvement:',
        steps: [
          { icon: 'FaUserMd', text: 'Schedule a follow-up with your doctor within 3 months' },
          { icon: 'FaHeartbeat', text: 'Monitor your health metrics more regularly' },
          { icon: 'FaListAlt', text: 'Address specific risk factors identified in your assessment' }
        ],
        resources: [
          { title: `Understanding ${prediction.conditionName} Risk`, link: `/resources/conditions/${prediction.conditionType}` },
          { title: 'Lifestyle Modification Guide', link: '/resources/lifestyle-changes' }
        ],
        schedulingOption: true
      };
    }
    
    // High risk
    return {
      title: 'Important Health Alert',
      description: 'Your high risk level requires prompt attention:',
      steps: [
        { icon: 'FaPhoneAlt', text: 'Contact your healthcare provider as soon as possible' },
        { icon: 'FaVial', text: 'Complete recommended diagnostic tests' },
        { icon: 'FaClipboardList', text: 'Prepare questions for your doctor about your condition' }
      ],
      resources: [
        { title: `${prediction.conditionName} - What You Need to Know`, link: `/resources/conditions/${prediction.conditionType}/critical` },
        { title: 'Patient Support Services', link: '/resources/support' }
      ],
      urgentScheduling: true
    };
  };
  
  const plan = getActionPlan(prediction);
  
  return (
    <div className="risk-action-plan">
      <h3 className="plan-title">{plan.title}</h3>
      <p className="plan-description">{plan.description}</p>
      
      <div className="action-steps">
        {plan.steps.map((step, index) => (
          <div key={index} className="step-item">
            <div className="step-icon">
              <Icon name={step.icon} size={24} />
            </div>
            <p>{step.text}</p>
          </div>
        ))}
      </div>
      
      {(plan.schedulingOption || plan.urgentScheduling) && (
        <div className="scheduling-section">
          <Link 
            to="/patient/appointments/schedule" 
            className={`btn ${plan.urgentScheduling ? 'btn-urgent' : 'btn-primary'}`}
          >
            <Icon name="FaCalendarPlus" size={16} />
            {plan.urgentScheduling ? 'Schedule Urgent Appointment' : 'Schedule Follow-up'}
          </Link>
        </div>
      )}
      
      <div className="resources-section">
        <h4>Helpful Resources</h4>
        <ul className="resource-links">
          {plan.resources.map((resource, index) => (
            <li key={index}>
              <Link to={resource.link}>
                <Icon name="FaFileAlt" size={16} /> {resource.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RiskActionPlan;
