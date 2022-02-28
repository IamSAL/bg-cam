import React, { useState, useRef, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'user',
};

async function downloadImage(imageSrc) {
  const image = await fetch(imageSrc);
  const imageBlog = await image.blob();
  const imageURL = URL.createObjectURL(imageBlog);

  const link = document.createElement('a');
  link.href = imageURL;
  link.download = `output-${new Date().getMilliseconds()}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const Result = ({ result }) => {
  const { input, out } = result;
  const webcamRef = React.useRef(null);

  const [capturedImage, setCapturedImage] = useState('');
  useEffect(() => {
    setTimeout(() => {
      document
        .querySelector('.result_parent')
        .scrollIntoView({ behavior: 'smooth' });
    }, 200);
  }, [result]);
  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  }, [webcamRef]);

  return (
    <div class="row mw-100 p-5 result_card">
      <Card className="text-center w-100">
        <Card.Header>{new Date().toString()}</Card.Header>
        <Card.Body>
          <div class="row mw-100">
            <div class="col-6">
              <img src={input} alt="" className="w-100"></img>
            </div>
            <div class="col-6">
              <img src={out} alt="" className="w-100"></img>
            </div>
          </div>
        </Card.Body>
        <Card.Footer className="text-muted">
          {' '}
          <Button variant="primary" onClick={() => downloadImage(out)}>
            Download
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Result;
