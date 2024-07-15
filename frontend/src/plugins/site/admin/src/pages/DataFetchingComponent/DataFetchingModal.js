import React, { useState, useEffect } from "react";
import {
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Typography,
  Button,
} from "@strapi/design-system";
import axios from 'axios';
import { useParams } from "react-router-dom";

const DataModal = ({ setShowModal }) => {
  const [postData, setPostData] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [appData, setAppData] = useState(null);
  const [postMedia, setPostMedia] = useState(null);
  const siteId = useParams().id;
  const [selectedContentType, setSelectedContentType] = useState("postData");
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const responses = await Promise.all([
          fetch(`/api/sites/${siteId}`),
          fetch(`/api/sites/${siteId}`),
          fetch(`/api/sites/${siteId}`),
          fetch(`/api/sites/${siteId}`),
        ]);

        const data = await Promise.all(responses.map(res => res.json()));

        setPostData(data[0].data.attributes.postData);
        setPageData(data[1].data.attributes.pageData);
        setAppData(data[2].data.attributes.appData);
        setPostMedia(data[3].data.attributes.postMedia);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [siteId]);

  const handleContentTypeButtonClick = (contentType) => {
    setSelectedContentType(contentType);
  };

  const sendDataToApi = async () => {
    try {
      let selectedDataArray = [];
      let endpoint = '';

      switch (selectedContentType) {
        case 'postData':
          if (!postData) {
            throw new Error("No postData available to send");
          }
          selectedDataArray = Array.isArray(postData) ? postData : [postData];
          endpoint = "/api/posts";
          break;
        case 'pageData':
          if (!pageData) {
            throw new Error("No pageData available to send");
          }
          selectedDataArray = Array.isArray(pageData) ? pageData : [pageData];
          endpoint = "/api/pages";
          break;
        case 'appData':
          if (!appData) {
            throw new Error("No appData available to send");
          }
          selectedDataArray = Array.isArray(appData) ? appData : [appData];
          endpoint = "/api/apps";
          break;
        default:
          throw new Error("Invalid content type selected");
      }

      for (const dataItem of selectedDataArray) {
        if (typeof dataItem.title === 'object' && dataItem.title.rendered) {
          dataItem.title = dataItem.title.rendered;
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: dataItem }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to send ${selectedContentType} to API: ${errorData.message}`);
        }
      }

      console.log(`${selectedContentType} sent successfully to API`);
    } catch (error) {
      console.error("Error sending data to API:", error);
    }
  };

  const downloadImages = async () => {
    try {
      if (!postMedia || !Array.isArray(postMedia)) {
        throw new Error("No postMedia available to download");
      }

      setMessage('Processing...');

      const imageDetails = postMedia.map(mediaItem => ({
        url: mediaItem.source_url,
        id: mediaItem.id,
        sizes: mediaItem.media_details.sizes,
        mimeType: mediaItem.mime_type
      }));

      const response = await axios.post('http://localhost:3000/proxy', { imageDetails });

      if (response.status !== 200) {
        throw new Error('Failed to fetch images from server');
      }

      const { filenames } = response.data;
      console.log("Downloaded images:", filenames);

      setMessage('Download success');

    } catch (error) {
      console.error("Error downloading images:", error);
      setMessage('Error downloading images');
    }
  };

  const renderContent = () => {
    switch (selectedContentType) {
      case "postData":
        return (
          <div>
            <Typography variant="sigma">Post Data:</Typography>
            <pre style={{ color: "white" }}>{JSON.stringify(postData, null, 2)}</pre>
          </div>
        );
      case "pageData":
        return (
          <div>
            <Typography variant="sigma">Page Data:</Typography>
            <pre style={{ color: "white" }}>{JSON.stringify(pageData, null, 2)}</pre>
          </div>
        );
      case "appData":
        return (
          <div>
            <Typography variant="sigma">App Data:</Typography>
            <pre style={{ color: "white" }}>{JSON.stringify(appData, null, 2)}</pre>
          </div>
        );
      case "postMedia":
        return (
          <div>
            <Typography variant="sigma">Post Media:</Typography>
            <pre style={{ color: "white" }}>{JSON.stringify(postMedia, null, 2)}</pre>
          </div>
        );
      default:
        return <Typography>Loading...</Typography>;
    }
  };

  return (
    <ModalLayout onClose={() => setShowModal(false)} labelledBy="title">
      <ModalHeader>
        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
          Available Data
        </Typography>
      </ModalHeader>
      <ModalBody>
        <div style={{ display: "flex" }}>
          {["postData", "pageData", "appData", "postMedia"].map((contentType) => (
            <Button
              key={contentType}
              onClick={() => handleContentTypeButtonClick(contentType)}
              variant={contentType === selectedContentType ? "primary" : "secondary"}
              style={{ marginRight: "10px", marginBottom: "15px" }}
            >
              {contentType.toUpperCase()}
            </Button>
          ))}
        </div>
        <div>
          {renderContent()}
        </div>
      </ModalBody>
      <ModalFooter
        startActions={
          <Button onClick={() => setShowModal(false)} variant="tertiary">
            Close
          </Button>
        }
        endActions={
          <>
            <Button onClick={sendDataToApi} variant="primary">
              Send Data
            </Button>
            {selectedContentType === "postMedia" && (
              <div>
                <Button onClick={downloadImages} variant="secondary">
                  Download Images
                </Button>
                {message && <p>{message}</p>}
              </div>
            )}
          </>
        }
      />
    </ModalLayout>
  );
};

export default DataModal;
