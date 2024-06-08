import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Modal, Button } from 'react-bootstrap';

// Local Imports
import BurndownChart from '../components/BurndownChart.jsx';
import BarChart from '../components/BarChart.jsx';
import { getRequest } from '../controllers/Database.jsx';

// Reports
import { getTaskByState, getWeeks, getIdealProgressRate, getActualProgress, DownloadReport } from '../controllers/ReportsController.jsx'

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

  // Reports
  const [showModal, setShowModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  // Reports

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
      const tasks = getTaskByState(selectedProjectData);
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

  // Reports
  const handleFormatChange = (e) => {
    const format = e.target.value;
    setSelectedFormat(format);
  };

  const handleLanguageChange = (e) => {
    const language = e.target.value;
    setSelectedLanguage(language);
  };

  const handleDownload = () => {
    const nombreProyecto = selectedProject; // asumiendo que existe un selectedProject handler
    const info = [nombreProyecto, countPending, countProgress, countFinished];
    DownloadReport('projects', selectedFormat, selectedLanguage, info);
  };

  const handleSend = (e) => {

  };

  const handleModalShow = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);
  // Reports

  return (
    <Container fluid className="vw-100 m-header vh-200 bg-secondary">
      <Row className="p-3 color-secondary mb-3">
        <Col><h1>Statistics</h1></Col>
        {// Reports
        }
        <div className="d-grid gap-2 mt-5">
          <Button onClick={handleModalShow} className="btn btn-lg btn-primary">Generate report</Button>
        </div>
        {// Reports
        }
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
      {// Reports
      }
      <Modal show={showModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
              <Modal.Title>Report</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="color-secondary mb-3">
              <Col><p>Choose the the format and the language</p></Col>
            </Row>
            <Row className="color-secondary mb-3">
              <Col className="d-flex justify-content-center">
                <Form.Group>
                  <Form.Label>Format</Form.Label>
                  <Form.Select onChange={handleFormatChange}>
                    <option value="">Select a format</option>
                    <option value="PDF">PDF</option>
                    <option value="CSV">CSV</option>
                    <option value="XML">XML</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col className="d-flex justify-content-center">
                <Form.Group>
                  <Form.Label>Language</Form.Label>
                  <Form.Select onChange={handleLanguageChange}>
                    <option value="">Select a language</option>
                    <option value="Spanish">Spanish</option>
                    <option value="English">English</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
              <Button variant="primary" onClick={handleDownload}>Download</Button>
              <Button variant="primary" onClick={handleSend}>Send</Button>
              <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
          </Modal.Footer>
      </Modal>
      {// Reports
      }
    </Container>
  );
};

export default Statistics;