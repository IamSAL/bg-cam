import React, { useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import Result from './Result.jsx';
import { Tabs, Tab, Form, Button } from 'react-bootstrap';
const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'user',
};

export const safeParseJSON = (message) => {
  try {
    return JSON.parse(message);
  } catch (error) {
    return null;
  }
};

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

const WebcamCapture = () => {
  const webcamRef = React.useRef(null);
  const [capturedImage, setCapturedImage] = useState('');
  const [results, setResults] = useState([]);
  const [Loading, setLoading] = useState(false);
  const [Mode, setMode] = useState('Camera');

  // useEffect(() => {
  //   localStorage.setItem('results', JSON.stringify(results));
  // }, [results]);

  // useEffect(() => {
  //   const results = safeParseJSON(localStorage.getItem('results')) || [];
  //   setResults(results);
  // }, []);

  const capture = React.useCallback(() => {
    setLoading(true);
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);

    var formData = new FormData();

    formData.append('file', dataURLtoFile(imageSrc));

    submitImage(
      formData,
      (result) => {
        setResults((prev) => {
          return [...prev, { input: imageSrc, out: result.image }];
        });
        setLoading(false);
      },
      () => {}
    );
  }, [webcamRef]);

  function submitImage(formData, cbOk, cbErr) {
    fetch('https://bg.sksalman.codes/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((result) => {
        if (cbOk) {
          cbOk(result);
        }
      })
      .catch((e) => {
        console.log(JSON.stringify(e));
        setLoading(false);
        if (cbErr) {
          cbErr(e);
        }
      });
  }

  return (
    <div>
      <Tabs
        id="controlled-tab-example"
        activeKey={Mode}
        onSelect={(k) => setMode(k)}
        className="mb-3"
      >
        <Tab eventKey="Camera" title="Camera">
          <div className={`row ${Loading ? 'disabled' : ''}`}>
            <div className="col-8 col-sm-12">
              {Loading ? (
                <div className="text-center">
                  <img
                    src={capturedImage}
                    style={{ height: '720px', maxWidth: '100vw' }}
                    alt=""
                  />
                </div>
              ) : (
                <Webcam
                  audio={false}
                  height={720}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width={'100%'}
                  mirrored
                  videoConstraints={videoConstraints}
                />
              )}
            </div>
            <div className="col-2 col-sm-12 d-flex flex-center justify-content-center align-items-center p-3">
              {Loading ? (
                <button className="btn btn-primary" type="button" disabled>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Processing...
                </button>
              ) : (
                <button onClick={capture} className="btn btn-primary">
                  Capture
                </button>
              )}
            </div>
          </div>
        </Tab>
        <Tab eventKey="Upload" title="Upload">
          <div className={`p-5 ${Loading ? 'disabled' : ''}`}>
            <Form.Group controlId="formFileLg" className="mb-3">
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  setLoading(true);
                  var formData = new FormData(e.target);
                  submitImage(
                    formData,
                    (result) => {
                      const file = formData.get('file');

                      var reader = new FileReader();

                      reader.onloadend = function () {
                        setResults((prev) => {
                          return [
                            ...prev,
                            { input: reader.result, out: result.image },
                          ];
                        });
                      };

                      if (file) {
                        reader.readAsDataURL(file);
                      } else {
                        preview.src = '';
                      }

                      setLoading(false);
                    },
                    () => {}
                  );
                }}
              >
                <Form.Label>Upload an image</Form.Label>
                <Form.Control type="file" size="md" name="file" required />

                <div className="submit py-3">
                  {Loading ? (
                    <button className="btn btn-primary" type="button" disabled>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Processing...
                    </button>
                  ) : (
                    <Button variant="primary" type="submit">
                      Upload
                    </Button>
                  )}
                </div>
              </Form>
            </Form.Group>
          </div>
        </Tab>
        <Tab eventKey="Outputs" title="Outputs">
          {[...results].reverse().map((result) => {
            return <Result result={result} />;
          })}
        </Tab>
      </Tabs>

      <div className="result_parent">
        {Mode != 'Outputs' &&
          [...results].reverse().map((result) => {
            return <Result result={result} />;
          })}
      </div>
    </div>
  );
};

export default WebcamCapture;
