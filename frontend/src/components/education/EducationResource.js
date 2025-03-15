import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const EducationResource = ({ resourceId, cancerType }) => {
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedResources, setRelatedResources] = useState([]);
  
  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/v1/education/resources/${resourceId || 'cancer-types/' + cancerType}`);
        setResource(res.data.data);
        
        // Get related resources
        const relatedRes = await axios.get(`/api/v1/education/resources/related/${resourceId || cancerType}`);
        setRelatedResources(relatedRes.data.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load education resource');
        setLoading(false);
      }
    };

    fetchResource();
  }, [resourceId, cancerType]);

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!resource) return <div className="not-found">Resource not found</div>;

  return (
    <div className="education-resource">
      <h2>{resource.title}</h2>
      
      <div className="resource-metadata">
        <div className="meta-item">
          <i className="fas fa-calendar-alt"></i> {new Date(resource.publishedDate).toLocaleDateString()}
        </div>
        <div className="meta-item">
          <i className="fas fa-bookmark"></i> {resource.category}
        </div>
        {resource.readingTime && (
          <div className="meta-item">
            <i className="fas fa-clock"></i> {resource.readingTime} min read
          </div>
        )}
      </div>
      
      <div className="resource-content">
        <ReactMarkdown>{resource.content}</ReactMarkdown>
      </div>
      
      <div className="resource-footer">
        <div className="resource-sources">
          <h4>Sources</h4>
          <ul className="sources-list">
            {resource.sources.map((source, index) => (
              <li key={index}>
                {source.url ? (
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.name}
                  </a>
                ) : (
                  source.name
                )}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="related-resources">
          <h4>Related Resources</h4>
          {relatedResources.length > 0 ? (
            <ul className="related-list">
              {relatedResources.map(related => (
                <li key={related._id}>
                  <a href={`/education/${related._id}`}>
                    {related.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No related resources found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationResource;
