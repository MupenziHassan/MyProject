import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const DashboardStats = ({ stats }) => {
  return (
    <Row className="mb-4">
      {stats.map((stat, index) => (
        <Col md={6} lg={3} className="mb-4 mb-lg-0" key={index}>
          <Card className={`dashboard-stat-card bg-${stat.color} text-white h-100`}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-2">{stat.title}</h6>
                  <h2 className="mb-0">{stat.value}</h2>
                  {stat.subtitle && <small>{stat.subtitle}</small>}
                </div>
                <div className="stat-icon">
                  <i className={`fas fa-${stat.icon} fa-3x opacity-50`}></i>
                </div>
              </div>
              {stat.link && (
                <Link to={stat.link} className="text-white stretched-link mt-3 d-block">
                  <small>{stat.linkText} <i className="fas fa-arrow-right ms-1"></i></small>
                </Link>
              )}
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DashboardStats;
