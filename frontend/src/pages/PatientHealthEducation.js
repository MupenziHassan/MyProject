import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/apiConfig';
import { Icon } from '../utils/IconFallbacks';
import '../styles/HealthEducation.css';

const PatientHealthEducation = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [educationResources, setEducationResources] = useState([]);
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);

  useEffect(() => {
    const fetchEducationResources = async () => {
      try {
        // In a real app, these would come from API calls
        setEducationResources([
          {
            id: 1,
            category: 'Cancer Awareness',
            title: 'Early Signs of Breast Cancer',
            description: 'Learn about early warning signs of breast cancer that should prompt a medical check-up.',
            imageUrl: '/images/education/breast-cancer-awareness.jpg',
            readTime: '5 min',
            featured: true,
            datePublished: '2023-06-15'
          },
          {
            id: 2,
            category: 'Preventive Care',
            title: 'Prostate Cancer Screening Guidelines',
            description: 'Age-appropriate prostate cancer screening recommendations for Rwandan men.',
            imageUrl: '/images/education/prostate-screening.jpg',
            readTime: '8 min',
            featured: true,
            datePublished: '2023-05-22'
          },
          {
            id: 3,
            category: 'Wellness',
            title: 'Nutrition & Cancer Prevention',
            description: 'Dietary recommendations based on Rwandan cuisine to help reduce cancer risk.',
            imageUrl: '/images/education/nutrition-rwanda.jpg',
            readTime: '6 min',
            datePublished: '2023-04-10'
          },
          {
            id: 4,
            category: 'Community',
            title: 'Cancer Support Groups in Rwanda',
            description: 'Local support networks for patients and families affected by cancer.',
            imageUrl: '/images/education/support-groups-rwanda.jpg',
            readTime: '4 min',
            datePublished: '2023-03-05'
          },
          {
            id: 5,
            category: 'Lifestyle',
            title: 'Physical Activity for Cancer Prevention',
            description: 'How regular exercise can help reduce your risk of cancer development.',
            imageUrl: '/images/education/exercise-rwanda.jpg',
            readTime: '7 min',
            datePublished: '2023-02-18'
          },
          {
            id: 6,
            category: 'Treatment',
            title: 'Modern Cancer Treatments at Ubumuntu',
            description: 'Learn about the latest cancer treatments available at Ubumuntu Clinic.',
            imageUrl: '/images/education/treatments-ubumuntu.jpg',
            readTime: '10 min',
            datePublished: '2023-01-30'
          },
          {
            id: 7,
            category: 'Cancer Awareness',
            title: 'Understanding Cervical Cancer',
            description: 'Essential information about cervical cancer prevention and early detection.',
            imageUrl: '/images/education/cervical-cancer.jpg',
            readTime: '6 min',
            datePublished: '2022-12-12'
          },
          {
            id: 8,
            category: 'Research',
            title: 'Cancer Research Advancements in Africa',
            description: 'Recent developments in cancer research relevant to the African context.',
            imageUrl: '/images/education/research-africa.jpg',
            readTime: '12 min',
            datePublished: '2022-11-05'
          }
        ]);

        setFeaturedCampaigns([
          {
            id: 1,
            title: 'Breast Cancer Awareness Month',
            description: 'Join our community screenings throughout October.',
            imageUrl: '/images/campaigns/breast-cancer-month.jpg',
            startDate: '2023-10-01',
            endDate: '2023-10-31',
            registrationUrl: '/patient/campaigns/breast-cancer-awareness/register'
          },
          {
            id: 2,
            title: 'Men\'s Health Screening Week',
            description: 'Free prostate cancer screenings for men over 45.',
            imageUrl: '/images/campaigns/mens-health.jpg',
            startDate: '2023-11-12',
            endDate: '2023-11-18',
            registrationUrl: '/patient/campaigns/mens-health/register'
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching education resources:', error);
        setLoading(false);
      }
    };
    
    fetchEducationResources();
  }, []);

  // Get all unique categories
  const categories = ['all', ...new Set(educationResources.map(item => item.category))];

  // Filter resources based on search and category
  const filteredResources = educationResources.filter(resource => {
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get featured resources
  const featuredResources = educationResources.filter(resource => resource.featured);

  if (loading) {
    return <div className="page-loading">Loading health resources...</div>;
  }

  return (
    <div className="health-education-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Health Education</h1>
          <p>Doctor-approved resources to help you understand cancer prevention, detection, and treatment</p>
        </div>
        
        <div className="ubumuntu-clinic-badge">
          <img src="/images/ubumuntu-logo.png" alt="Ubumuntu Clinic" />
          <span>Provided by Ubumuntu Clinic</span>
        </div>
      </div>

      {/* Featured Campaigns */}
      {featuredCampaigns.length > 0 && (
        <section className="featured-campaigns">
          <h2>Current Health Campaigns</h2>
          <div className="campaigns-carousel">
            {featuredCampaigns.map(campaign => (
              <div key={campaign.id} className="campaign-card">
                <div className="campaign-image" style={{backgroundImage: `url(${campaign.imageUrl})`}}>
                  <div className="campaign-dates">
                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="campaign-details">
                  <h3>{campaign.title}</h3>
                  <p>{campaign.description}</p>
                  <Link to={campaign.registrationUrl} className="btn btn-primary">
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search and Filter */}
      <div className="search-filter-container">
        <div className="search-box">
          <Icon name="FaSearch" size={16} />
          <input 
            type="text"
            placeholder="Search for health topics..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <Icon name="FaTimes" size={14} />
            </button>
          )}
        </div>
        
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Resources Section */}
      {featuredResources.length > 0 && activeCategory === 'all' && searchQuery === '' && (
        <section className="featured-resources-section">
          <h2 className="section-title">Featured Resources</h2>
          <div className="featured-resources-grid">
            {featuredResources.map(resource => (
              <div key={resource.id} className="featured-resource-card">
                <div 
                  className="resource-image" 
                  style={{backgroundImage: `url(${resource.imageUrl})`}}
                >
                  <span className="resource-category">{resource.category}</span>
                </div>
                <div className="resource-content">
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                  <div className="resource-meta">
                    <span className="resource-date">
                      <Icon name="FaCalendarAlt" size={14} /> 
                      {new Date(resource.datePublished).toLocaleDateString()}
                    </span>
                    <span className="read-time">
                      <Icon name="FaClock" size={14} /> 
                      {resource.readTime} read
                    </span>
                  </div>
                  <Link to={`/patient/health-education/${resource.id}`} className="btn btn-outline-primary">
                    Read Article
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Resources */}
      <section className="all-resources-section">
        <h2 className="section-title">
          {searchQuery ? `Search Results for "${searchQuery}"` : 
           activeCategory !== 'all' ? `${activeCategory} Resources` : 
           'All Health Resources'}
        </h2>
        
        {filteredResources.length > 0 ? (
          <div className="resources-grid">
            {filteredResources.map(resource => (
              <Link 
                key={resource.id} 
                to={`/patient/health-education/${resource.id}`} 
                className="resource-card"
              >
                <div className="resource-card-image" style={{backgroundImage: `url(${resource.imageUrl})`}}>
                  <span className="resource-category-tag">{resource.category}</span>
                </div>
                <div className="resource-card-content">
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                  <div className="resource-card-meta">
                    <span className="read-time">
                      <Icon name="FaClock" size={12} /> {resource.readTime}
                    </span>
                    <span className="read-more">
                      Read More <Icon name="FaArrowRight" size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <Icon name="FaSearchMinus" size={48} />
            <p>No resources found matching your search.</p>
            <button className="btn btn-primary" onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}>
              View All Resources
            </button>
          </div>
        )}
      </section>

      {/* Ubumuntu Clinic Information */}
      <section className="clinic-information-section">
        <div className="clinic-info-container">
          <div className="clinic-description">
            <h2>About Ubumuntu Clinic</h2>
            <p>
              Ubumuntu Clinic specializes in cancer prevention, early detection, and treatment. 
              Our team of expert oncologists is committed to providing the highest quality care 
              using the latest medical technologies and treatment approaches.
            </p>
            <p>
              We believe that education is an essential component of cancer care. That's why we've 
              developed these resources to help you understand cancer risks, prevention strategies, 
              and treatment options.
            </p>
            <div className="clinic-actions">
              <a href="https://www.ubumuntuclinic.rw" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary">
                Visit Website
              </a>
              <Link to="/patient/appointments/schedule" className="btn btn-primary">
                Schedule Appointment
              </Link>
            </div>
          </div>
          <div className="clinic-contact-info">
            <h3>Contact Ubumuntu Clinic</h3>
            <div className="contact-items">
              <div className="contact-item">
                <Icon name="FaMapMarkerAlt" size={16} />
                <span>KG 11 Ave, Kigali, Rwanda</span>
              </div>
              <div className="contact-item">
                <Icon name="FaPhone" size={16} />
                <span>+250 782 123 456</span>
              </div>
              <div className="contact-item">
                <Icon name="FaEnvelope" size={16} />
                <span>info@ubumuntuclinic.rw</span>
              </div>
              <div className="contact-item">
                <Icon name="FaClock" size={16} />
                <span>Mon-Fri: 8AM-5PM, Sat: 9AM-12PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PatientHealthEducation;
