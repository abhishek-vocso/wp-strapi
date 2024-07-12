// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Typography,
  Button,
} from "@strapi/design-system";
import { useParams } from "react-router-dom";

// Define the Modal component
const DataModal = ({ setShowModal }) => {
  const [pricingFilterData, setPricingFilterData] = useState(null);
  const [cfCategoryData, setCfCategoryData] = useState(null);
  const [demo1Data, setDemo1Data] = useState(null);
  const siteId = useParams().id;
  const [selectedContentType, setSelectedContentType] = useState("pricingFilterData");

  useEffect(() => {
    console.log(`Fetching data for site ID: ${siteId}`);

    async function fetchData() {
      try {
        const pricingFilterDataResponse = await fetch(`/api/sites/${siteId}`);
        const cfCategoryDataResponse = await fetch(`/api/sites/${siteId}`);
        const demo1DataResponse = await fetch(`/api/sites/${siteId}`);

        if (!pricingFilterDataResponse.ok) {
          throw new Error("Failed to fetch pricingFilterData");
        }
        if (!cfCategoryDataResponse.ok) {
          throw new Error("Failed to fetch cfCategoryData");
        }
        if (!demo1DataResponse.ok) {
          throw new Error("Failed to fetch demo1Data");
        }

        const pricingFilterData = await pricingFilterDataResponse.json();
        const cfCategoryData = await cfCategoryDataResponse.json();
        const demo1Data = await demo1DataResponse.json();

        setPricingFilterData(pricingFilterData.data.attributes.pricingFilterData);
        setCfCategoryData(cfCategoryData.data.attributes.cfCategoryData);
        setDemo1Data(demo1Data.data.attributes.demo1Data);
        
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
        case 'pricingFilterData':
          if (!pricingFilterData) {
            throw new Error("No pricingFilterData available to send");
          }
          selectedDataArray = Array.isArray(pricingFilterData) ? pricingFilterData : [pricingFilterData];
          endpoint = "/api/pricingFilters";
          break;
        case 'cfCategoryData':
          if (!cfCategoryData) {
            throw new Error("No cfCategoryData available to send");
          }
          selectedDataArray = Array.isArray(cfCategoryData) ? cfCategoryData : [cfCategoryData];
          endpoint = "/api/cfcategorys";
          break;
        case 'demo1Data':
          if (!demo1Data) {
            throw new Error("No demo1Data available to send");
          }
          selectedDataArray = Array.isArray(demo1Data) ? demo1Data : [demo1Data];
          endpoint = "/api/demo1s";
          break;
        default:
          throw new Error("Invalid content type selected");
      }

      for (const dataItem of selectedDataArray) {
        // Ensure title is a string
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

      // Handle success notification or any other logic
      console.log(`${selectedContentType} sent successfully to API`);
    } catch (error) {
      console.error("Error sending data to API:", error);
    }
  };

  const renderContent = () => {
    switch (selectedContentType) {
      case "pricingFilterData":
        return (
          <div>
            <Typography variant="sigma">Pricing Filter Data:</Typography>
            <pre style={{ color: "white" }}>{JSON.stringify(pricingFilterData, null, 2)}</pre>
          </div>
        );
      case "cfCategoryData":
        return (
          <div>
            <Typography variant="sigma">Category Data:</Typography>
            <pre style={{ color: "white" }}>{JSON.stringify(cfCategoryData, null, 2)}</pre>
          </div>
        );
      case "demo1Data":
        return (
          <div>
            <Typography variant="sigma">Demo Data:</Typography>
            <pre style={{ color: "white" }}>{JSON.stringify(demo1Data, null, 2)}</pre>
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
          {["pricingFilterData", "cfCategoryData", "demo1Data"].map((contentType) => (
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
          </>
        }
      />
    </ModalLayout>
  );
};

export default DataModal;
