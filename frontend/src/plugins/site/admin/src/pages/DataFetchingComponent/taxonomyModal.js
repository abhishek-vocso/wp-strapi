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
import { useFetchClient, useNotification } from "@strapi/helper-plugin";
import { useParams } from "react-router-dom";

const TaxonomyModal = ({ setShowModal }) => {
  const { get, post } = useFetchClient();
  const siteId = useParams().id;
  const toggleNotification = useNotification();
  const [taxonomyKeys, setTaxonomyKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState({});
  const [taxonomyData, setTaxonomyData] = useState([]);
  const [displayType, setDisplayType] = useState("app"); 
  const [activeButton, setActiveButton] = useState("app");

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

        // Merge keys from all types
        const allKeysSet = new Set([
          ...Object.keys(filterDataTypes.post),
          ...Object.keys(filterDataTypes.app),
          ...Object.keys(filterDataTypes.page),
          ...Object.keys(filterDataTypes.agency),
          ...Object.keys(filterDataTypes.attachment),
          ...Object.keys(filterDataTypes.services),
        ]);

        // Convert the Set back to an array
        const allKeys = [...allKeysSet];

        // @ts-ignore
        setTaxonomyData(filterDataTypes);
        setTaxonomyKeys(allKeys);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  // Function to filter fields starting with an underscore
  const filterFields = (data) => {
    if (!data) return null;
    return Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) => key !== "ID" && !key.startsWith("_") && value === "taxonomy"
      ).map(([key, value]) => [key, data[key + "_post_type"]])
    );
  };

  const handleCheckboxChange = (key) => {
    setSelectedKeys((prevSelectedKeys) => {
      if (key in prevSelectedKeys) {
        // Uncheck the previously selected checkbox
        const { [key]: _, ...rest } = prevSelectedKeys;
        return rest;
      } else {
        // Check the newly selected checkbox
        return { [key]: key };
      }
    });
  };
  

  const handleNameChange = (key, newName) => {
    setSelectedKeys((prevSelectedKeys) => ({
      ...prevSelectedKeys,
      [key]: newName,
    }));
  };

  const toggleDisplayType = (type) => {
    setDisplayType(type);
    setActiveButton(type);
  };

  const createCollectionTypes = async () => {
    for (const key of Object.keys(selectedKeys)) {
      const modifiedKey = selectedKeys[key].replace(/_/g, '');
      const collectionName = modifiedKey;
      const singularName = modifiedKey;
      const pluralName = `${modifiedKey}s`;
      const displayName = selectedKeys[key];
      const description = `${key} Taxonomy`;

      try {
        const { data: existingContentTypes } = await get("/content-type-builder/content-types");
        if (existingContentTypes.data.some(type => type.uid === `api::${collectionName}.${collectionName}`)) {
          toggleNotification({
            type: "warning",
            message: `Content type name "${collectionName}" is already in use. Please change it.`,
          });
          continue;
        }

        // Define the attributes for the collection type
        const attributes = {
          name: { type: "text" },
          slug: { type: "text" },
          taxonomy: { type: "text" },
          link: { type: "text" },
          description: { type: "text" },
          count: { type: "integer" },
          parent: { type: "integer" },
          meta: { type: "json" }
        };
        

        // Create the collection type
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
            attributes,
          },
        });

        if (status === 201) {
          toggleNotification({
            type: "success",
            message: `${displayName} collection type created successfully`,
          });
        }
      } catch (error) {
        toggleNotification({
          type: "warning",
          message: `Failed to create collection type for ${displayName}. Error: ${error.message}`,
        });
      }
    }
  };

  return (
    <ModalLayout
      onClose={() => setShowModal(false)}
      labelledBy="title"
      as="form"
    >
      <ModalHeader>
        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
          {displayType.charAt(0).toUpperCase() + displayType.slice(1)}
        </Typography>
        <div style={{ display: "flex" }}>
          {["app", "post", "page", "agency", "attachment", "services"].map((type) => (
            <Button
              key={type}
              variant="tertiary"
              onClick={() => toggleDisplayType(type)}
              active={activeButton === type}
              style={{ marginRight: "10px" }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </ModalHeader>
      <ModalBody>
        <ul>
          {taxonomyKeys
            .filter((key) => key in taxonomyData[displayType])
            .map((key, index) => (
              <li key={index} style={{ display: "flex", alignItems: "center", marginBottom: "10px" , color: "white"}}>
                <label>
                  <input
                    type="checkbox"
                    checked={key in selectedKeys}
                    onChange={() => handleCheckboxChange(key)}
                    style={{ marginRight: "10px" }}
                  />
                  {key}
                </label>
                {key in selectedKeys && (
                  <TextInput
                    placeholder="Enter new name"
                    value={selectedKeys[key]}
                    onChange={(e) => handleNameChange(key, e.target.value)}
                    aria-label={`New name for ${key}`}
                    style={{ marginLeft: "10px" }}
                  />
                )}
              </li>
            ))}
        </ul>
      </ModalBody>
      <ModalFooter
        startActions={
          <Button variant="tertiary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        }
        endActions={<Button onClick={createCollectionTypes}>Create Collection Types</Button>}
      />
    </ModalLayout>
  );
};

export default TaxonomyModal;
