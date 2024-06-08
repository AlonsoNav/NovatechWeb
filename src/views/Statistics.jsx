import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Modal, Button } from 'react-bootstrap';

// Local Imports
import BurndownChart from '../components/BurndownChart.jsx';
import BarChart from '../components/BarChart.jsx';
import { getRequest } from '../controllers/Database.jsx';
import { getTaskByState, getWeeks, getIdealProgressRate, getActualProgress } from '../controllers/ReportsController.jsx'

const Statistics = () => {
  const [projects, setProjects] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [countPending, setCountPending] = useState(0);
  const [countProgress, setCountProgress] = useState(0);
  const [countFinished, setCountFinished] = useState(0);
  const [totalWeeks, setTotalWeeks] = useState(0);
  const [totalStoryPoints, setTotalStoryPoints] = useState(0);
  const [idealProgressRate, setIdealProgressRate] = useState(0);
  const [actualProgress, setActualProgress] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');

  const fetchProjects = async () => {
    try {
      const response = await getRequest('proyectos/');
      if (!response) {
        setToastMessage('Could not connect to the server.');
        setShowToast(true);
      } else {
        const projectsData = await response.json();
        setProjects(projectsData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectChange = async (e) => {
    const projectName = e.target.value;
    setSelectedProject(projectName);
    if (projectName === '') {
      setCountPending(0);
      setCountProgress(0);
      setCountFinished(0);
      return;
    }
    const selectedProjectData = projects.find(project => project.nombre === projectName);
    if (selectedProjectData) {
      // Bar Chart
      const tasks = getTaskByState(selectedProjectData.tareas);
      setCountPending(tasks[0]);
      setCountProgress(tasks[1]);
      setCountFinished(tasks[2]);

      // Burndown Chart
      const weeksData = getWeeks(selectedProjectData);
      const idealProgress = getIdealProgressRate(selectedProjectData, weeksData - 1);
      const idealProgressRateData = idealProgress[0];
      const totalStoryPointsData = idealProgress[1];
      const actualProgressData = getActualProgress(selectedProjectData, weeksData - 1, totalStoryPointsData);

      setTotalWeeks(weeksData);
      setIdealProgressRate(idealProgressRateData);
      setTotalStoryPoints(totalStoryPointsData);
      setActualProgress(actualProgressData);
    }
  };

  return (
    <Container fluid className="vw-100 m-header vh-200 bg-secondary">
      <Row className="p-3 color-secondary mb-3">
        <Col><h1>Statistics</h1></Col>
      </Row>
      <Row className="mb-3">
        <Col className="d-flex justify-content-center">
          <Form.Group>
            <Form.Label>Project name</Form.Label>
            <Form.Select onChange={handleProjectChange}>
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project.nombre}>
                  {project.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      {selectedProject && (
        <Row>
          <Col className="mt-3">
            <h1>Burndown Chart</h1>
            <BurndownChart 
              totalWeeks={totalWeeks}
              totalStoryPoints={totalStoryPoints}
              idealProgressRate={idealProgressRate}
              actualProgress={actualProgress}
            />
          </Col>
          <Col className="mt-3">
            <h1>Bar Chart</h1>
            <BarChart
              pendingTasks={countPending}
              progressTasks={countProgress}
              finishedTasks={countFinished}
            />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Statistics;