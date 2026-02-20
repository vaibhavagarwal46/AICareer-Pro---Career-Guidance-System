import React from 'react';
import { Card, ListGroup, Badge, Accordion } from 'react-bootstrap';
import { FaArrowAltCircleRight, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const LearningRoadmap = ({ roadmap, career }) => {
  if (!roadmap || roadmap.length === 0) 
    return null;
  return (
    <Card className="mt-5 shadow-lg border-0">
      <Card.Header className="bg-dark text-white p-3">
        <h3 className="mb-0">Your Personalized Roadmap to {career}</h3>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-4">
          Based on your assessment, we've identified the following learning path to bridge your skill gaps.
        </p>
        <Accordion defaultActiveKey="0">
          {roadmap.map((step, index) => (
            <Accordion.Item eventKey={index.toString()} key={index}>
              <Accordion.Header>
                <div className="d-flex align-items-center w-100">
                  {step.priority === 1 ? (
                    <FaExclamationTriangle className="text-danger me-2" />
                  ) : (
                    <FaArrowAltCircleRight className="text-primary me-2" />
                  )}
                  <span className="fw-bold">{step.skill}</span>
                  <Badge 
                    bg={step.priority === 1 ? 'danger' : 'warning'} 
                    className="ms-auto me-3"
                  >
                    {step.status}
                  </Badge>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <p>{step.note}</p>
                <div className="d-flex gap-2">
                    <a href={`https://www.coursera.org/search?query=${step.skill}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">Find Courses</a>
                    <a href={`https://roadmap.sh/`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info">View Detailed Roadmap</a>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Card.Body>
    </Card>
  );
};
export default LearningRoadmap;