// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Typography,
  Button,
  TextInput,
} from "@strapi/design-system";
import {
  useAutoReloadOverlayBlocker,
  useFetchClient,
  useNotification,
} from "@strapi/helper-plugin";
import { useParams } from "react-router-dom";
import { useQueryParams } from "@strapi/helper-plugin";

// Define the Modal component
const Modal = ({ setShowModal }) => {
  const { post, get } = useFetchClient();
  const [jsonData, setJsonData] = useState(null);
  const siteId = useParams().id;
  const [{ query }] = useQueryParams();
  const [isLoading, setIsLoading] = useState(false);
  const toggleNotification = useNotification();
  const [selectedContentType, setSelectedContentType] = useState("post");
  const [contentTypeNames, setContentTypeNames] = useState({});
  const { lockAppWithAutoreload, unlockAppWithAutoreload } = useAutoReloadOverlayBlocker();

  // Fetch data when component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/sites/${siteId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();

        // Filter out fields starting with an underscore
        const filterDataTypes = {
          post: filterFields(data?.data?.attributes?.post),
          app: filterFields(data?.data?.attributes?.app),
          page: filterFields(data?.data?.attributes?.page),
          agency: filterFields(data?.data?.attributes?.agency),
          attachment: filterFields(data?.data?.attributes?.attachment),
          services: filterFields(data?.data?.attributes?.services),
        };

        setJsonData(filterDataTypes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  // Function to handle the click event on content type buttons
  const handleContentTypeButtonClick = (contentType) => {
    setSelectedContentType(contentType);
  };

  // Function to filter fields starting with an underscore
  const filterFields = (data) => {
    if (!data) return null;
    return Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) =>
          key !== "ID" && !key.startsWith("_") && value !== "taxonomy"
      )
    );
  };

  // Function to handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Lock the app with autoreload blocker
    lockAppWithAutoreload({
      title: "Creating Content Type",
      description: "Please wait...",
      icon: "reload",
    });

    setIsLoading(true);

    try {
      const checkedFields = ["post", "app", "page", "agency", "attachment", "services"].reduce((acc, type) => {
        acc[type] = Object.entries(jsonData[type] || {}).reduce((accFields, [key]) => {
          const checkbox = document.getElementById(`${type}_${key}`);
          if (checkbox && checkbox.checked) {
            accFields[key] = jsonData[type][key];
          }
          return accFields;
        }, {});
        return acc;
      }, {});

      const contentTypeAttributes = Object.keys(checkedFields).reduce((acc, type) => {
        if (Object.keys(checkedFields[type] || {}).length > 0) {
          acc = {
            ...acc,
            ...Object.keys(checkedFields[type]).reduce((fieldAcc, key) => {
              fieldAcc[`${key}`] = {
                type: getType(checkedFields[type][key], key),
              };
              return fieldAcc;
            }, {})
          };
        }
        return acc;
      }, {});

      function getType(value, key) {
        if (["date", "date_gmt", "modified_gmt", "modified"].includes(key)) {
          return "date";
        }
        if (["password"].includes(key)) {
          return "password";
        }
       if (["author"].includes(key)){
        return "integer"
       }
       if(["title"].includes(key)){
        return "json"
       }
       if(["content"].includes(key)){
        return "json"
       }
       if(["excerpt"].includes(key)){
        return "json"
       }
        return "text";
      }

      const newContentTypeName = contentTypeNames[selectedContentType] || selectedContentType;
      const collectionName = newContentTypeName.toLowerCase();
      const singularName = collectionName;
      const pluralName = collectionName + "s";
      const displayName = newContentTypeName.charAt(0).toUpperCase() + newContentTypeName.slice(1);
      const description = displayName;

      const { data: existingContentTypes } = await get("/content-type-builder/content-types");
      if (existingContentTypes.data.some(type => type.uid === `api::${collectionName}.${collectionName}`)) {
        throw new Error(`Content type name "${collectionName}" is already in use. Please change it.`);
      }

      const { status } = await post("/content-type-builder/content-types", {
        contentType: {
          kind: "collectionType",
          collectionName,
          singularName,
          pluralName,
          displayName,
          description,
          draftAndPublish: true,
          info: {},
          options: {},
          pluginOptions: {},
          attributes: contentTypeAttributes,
        },
      });

      if (status === 201) {
        toggleNotification({
          message: "Content types created successfully",
        });
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error creating content types:", error);
      toggleNotification({
        type: "warning",
        message: `${error.message}`,
      });
    } finally {
      setIsLoading(false);
      unlockAppWithAutoreload();
    }
  };

  // Handle name change for content types
  const handleNameChange = (newName) => {
    setContentTypeNames((prevNames) => ({
      ...prevNames,
      [selectedContentType]: newName,
    }));
  };

  // Render the modal component
  return (
    <ModalLayout
      onClose={() => setShowModal(false)}
      labelledBy="title"
      as="form"
      onSubmit={handleFormSubmit}
    >
      <ModalHeader>
        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
          Generate Content Type
        </Typography>
      </ModalHeader>
      <ModalBody>
        {/* Render content type buttons */}
        <div style={{ display: "flex" }}>
          {["post", "app", "page", "agency", "attachment", "services"].map((contentType) => (
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
        {/* Render selected content type */}
        {jsonData ? (
          <>
            {/* Input field to change the name of the content type */}
            <TextInput
              label="New Content Type Name"
              placeholder="Enter new content type name"
              value={contentTypeNames[selectedContentType] || ""}
              onChange={(e) => handleNameChange(e.target.value)}
              style={{ marginBottom: "20px" }}
            />
            {/* Render schema checkboxes for selected content type */}
            {Object.entries(jsonData[selectedContentType] || {}).map(([key, value]) => (
              <div
                key={`${selectedContentType}_${key}`}
                style={{ marginTop: "20px", fontSize: "25px" }}
              >
                <input
                  type="checkbox"
                  id={`${selectedContentType}_${key}`}
                  name={`${selectedContentType}_${key}`}
                  value={`${selectedContentType}_${key}`}
                  style={{ marginRight: "10px", color: "white" }}
                />
                <label htmlFor={`${selectedContentType}_${key}`}>
                  <span style={{ minWidth: "150px", display: "inline-block", color: "white" }}>
                    {key}
                  </span>
                  <span style={{ minWidth: "100px", display: "inline-block", color: "white" }}>
                    ({typeof value})
                  </span>
                </label>
              </div>
            ))}
          </>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </ModalBody>
      <ModalFooter
        startActions={
          <Button onClick={() => setShowModal(false)} variant="tertiary">
            Cancel
          </Button>
        }
        endActions={<Button type="submit">Create Content Type</Button>}
      />
    </ModalLayout>
  );
};

export default Modal;
