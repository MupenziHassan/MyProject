import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const PageHeader = ({ title, subtitle, buttonText, buttonIcon, buttonVariant, buttonAction, showBackButton = false, backPath }) => {
  const navigate = useNavigate();
  
  return (
    <Row className="align-items-center mb-4">
      <Col>
        <div className="d-flex align-items-center">
          {showBackButton && (
            <Button 
              variant="light" 
              className="me-3"
              onClick={() => navigate(backPath || -1)}
            >
              <i className="fas fa-arrow-left"></i>
            </Button>
          )}
          <div>
            <h2 className="mb-0">{title}</h2>
            {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
          </div>
        </div>
      </Col>
      {buttonText && (
        <Col xs="auto">
          <Button 
            variant={buttonVariant || "primary"}
            onClick={buttonAction || (() => {})}
          >
            {buttonIcon && <i className={`fas fa-${buttonIcon} me-2`}></i>}
            {buttonText}
          </Button>
        </Col>
      )}
    </Row>
  );
};

export default PageHeader;
