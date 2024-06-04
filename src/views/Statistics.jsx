import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';

// Local Imports
import BurndownChart from '../components/BurndownChart.jsx';
import BarChart from '../components/BarChart.jsx';
import { getRequest } from '../controllers/Database.jsx';

const Statistics = () => {
  const [projects, setProjects] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [countPending, setCountPending] = useState(0);
  const [countProgress, setCountProgress] = useState(0);
  const [countFinished, setCountFinished] = useState(0);
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

  const handleProjectChange = (e) => {
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
      // Burndown Chart

      // Bar Chart
      const { tareas } = selectedProjectData;
      let pendingCount = 0;
      let progressCount = 0;
      let finishedCount = 0;
      tareas.forEach(tarea => {
        if (tarea.estado === 'Todo') pendingCount++;
        else if (tarea.estado === 'Doing') progressCount++;
        else if (tarea.estado === 'Done') finishedCount++;
      });
      setCountPending(pendingCount);
      setCountProgress(progressCount);
      setCountFinished(finishedCount);
    }
  };

  return (
    <Container fluid className="vw-100 m-header vh-100 bg-secondary">
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
            <BurndownChart />
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