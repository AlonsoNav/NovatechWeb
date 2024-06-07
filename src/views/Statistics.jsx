import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Modal, Button } from 'react-bootstrap';

// Local Imports
import BurndownChart from '../components/BurndownChart.jsx';
import BarChart from '../components/BarChart.jsx';
import { getRequest } from '../controllers/Database.jsx';
import ModalComponent from '../components/ModalComponent.jsx';

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
  const [showModal, setShowModal] = useState(false);

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

  const getWeeks = (selectedProjectData) => {
    let fechaFinal = selectedProjectData.fechaFin;
    if (fechaFinal == null) {
      fechaFinal = new Date();
    } else {
      fechaFinal = new Date(selectedProjectData.fechaFin);
    }
    let fechaInicio = new Date(selectedProjectData.fechaInicio);
    const diffMiliS = Math.abs(fechaFinal - fechaInicio);
    const totalWeeks = Math.ceil(diffMiliS / (1000 * 60 * 60 * 24 * 7)) + 1;
    setTotalWeeks(totalWeeks);
    return totalWeeks - 1;
  };

  const getIdealProgressRate = (selectedProjectData, totalWeeks) => {
    const { tareas } = selectedProjectData;
    let totalStoryPoints = 0;

    tareas.forEach(tarea => {
      totalStoryPoints += tarea.storyPoints;
    });

    const idealProgressRate = totalStoryPoints / totalWeeks;
    setTotalStoryPoints(totalStoryPoints);
    setIdealProgressRate(idealProgressRate);
    return totalStoryPoints;
  };

  const getActualProgress = (selectedProjectData, totalWeeks, totalStoryPoints) => {
    const { tareas } = selectedProjectData;
    let actualProgress = [totalStoryPoints];

    for (var i = 1; i <= totalWeeks; i++) {
      tareas.forEach(tarea => {
        if (tarea.estado === 'Done') {
          let fechaInicio = new Date(selectedProjectData.fechaInicio);
          let fechaFinal = new Date(tarea.fechaFinal);
          const diffMiliS = Math.abs(fechaFinal - fechaInicio);
          const weeks = Math.ceil(diffMiliS / (1000 * 60 * 60 * 24 * 7));
          if (weeks === i) actualProgress.push(totalStoryPoints - tarea.storyPoints);
        }
      });
    }

    setActualProgress(actualProgress);
  };

  const handleBarChart = (selectedProjectData) => {
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
  };

  const handleBurndownChart = (selectedProjectData) => {
    const weeks = getWeeks(selectedProjectData);
    const totalStoryPoints = getIdealProgressRate(selectedProjectData, weeks);
    getActualProgress(selectedProjectData, weeks, totalStoryPoints);
  };

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
      handleBurndownChart(selectedProjectData);
      // Bar Chart
      handleBarChart(selectedProjectData);
    }
  };

  const handleReports = (e) => {

  };

  const handleModalShow = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);

  return (
    <Container fluid className="vw-100 m-header vh-200 bg-secondary">
      <Row className="p-3 color-secondary mb-3">
        <Col><h1>Statistics</h1></Col>
        <div className="d-grid gap-2 mt-5">
          <Button onClick={handleModalShow} className="btn btn-lg btn-primary">Reports</Button>
        </div>
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
      <Modal show={showModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
              <Modal.Title>Reports</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="color-secondary mb-3">
              <Col><p>Choose the type of report, the format and the language</p></Col>
            </Row>
            <Row className="color-secondary mb-3">
              <Col className="d-flex justify-content-center">
                <Form.Group>
                  <Form.Label>Type</Form.Label>
                  <Form.Select /*onChange={}*/>
                    <option value="">Select a format</option>
                    <option value="collaborators">Collaborators</option>
                    <option value="project">Project</option>
                    <option value="allProjects">All projects</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col className="d-flex justify-content-center">
                <Form.Group>
                  <Form.Label>Format</Form.Label>
                  <Form.Select /*onChange={}*/>
                    <option value="">Select a format</option>
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                    <option value="xml">XML</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col className="d-flex justify-content-center">
                <Form.Group>
                  <Form.Label>Language</Form.Label>
                  <Form.Select /*onChange={}*/>
                    <option value="">Select a language</option>
                    <option value="sp">Spanish</option>
                    <option value="en">English</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
              <Button variant="primary" onClick={handleReports}>Download</Button>
              <Button variant="primary" onClick={handleReports}>Send</Button>
              <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
          </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Statistics;