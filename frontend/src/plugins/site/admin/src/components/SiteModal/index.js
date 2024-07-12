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

const SiteModal = ({ setShowModal, addSite }) => {
  const [url, setUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [post, setPost] = useState(null);
  const [app, setApp] = useState(null);
  const [page, setPage] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [agency, setAgency] = useState(null);
  const [services, setServices] = useState(null);
  const [pricingFilterData, setPricingFilterData] = useState(null);
  const [cfCategoryData, setCfCategoryData] = useState(null);
  const [demo1Data, setDemo1Data] = useState(null);
  const [postMedia, setPostMedia] = useState(null);
  const [postData, setPostData] = useState([]);
  const [pageData, setPageData] = useState([]);
  const [appData, setAppData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [connectionSuccessful, setConnectionSuccessful] = useState(false);
  const [dataExtracted, setDataExtracted] = useState(false);
  const [addedUrls, setAddedUrls] = useState([]);

  useEffect(() => {
    const fetchExistingUrls = async () => {
      try {
        const response = await fetch("/api/sites");
        if (!response.ok) {
          throw new Error("Failed to fetch existing URLs");
        }
        const data = await response.json();
        const urls = data.map((site) => site.wordpressWebsiteUrl);
        setAddedUrls(urls);
      } catch (error) {
        console.error("Error fetching existing URLs:", error);
      }
    };

    fetchExistingUrls();
  }, []);

  const fetchWordPressData = async (endpoint, setter) => {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Error fetching data from ${endpoint}: ${response.statusText}`);
      }
      const data = await response.json();
      setter(data);
      return data;
    } catch (error) {
      console.error(`Failed to fetch data from ${endpoint}:`, error);
      throw error;
    }
  };

  const fetchAllWordPressPosts = async () => {
    try {
      const response = await fetch(`${url}/wp-json/wp/v2/posts?per_page=30`);
      if (!response.ok) {
        throw new Error(`Error fetching posts: ${response.statusText}`);
      }
      const data = await response.json();
      setPostData(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch WordPress posts:", error);
      throw error;
    }
  };

  const fetchAllWordPressPages = async () => {
    try {
      const response = await fetch(`${url}/wp-json/wp/v2/pages?per_page=25`);
      if (!response.ok) {
        throw new Error(`Error fetching pages: ${response.statusText}`);
      }
      const data = await response.json();
      setPageData(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch WordPress pages:", error);
      throw error;
    }
  };

  const fetchAllWordPressApps = async () => {
    try {
      const response = await fetch(`${url}/wp-json/wp/v2/app?per_page=15`);
      if (!response.ok) {
        throw new Error(`Error fetching apps: ${response.statusText}`);
      }
      const data = await response.json();
      setAppData(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch WordPress apps:", error);
      throw error;
    }
  };

  const fetchAllWordPressMedia = async () => {
    try {
      const response = await fetch(`${url}/wp-json/wp/v2/media?per_page=75`);
      if (!response.ok) {
        throw new Error(`Error fetching media: ${response.statusText}`);
      }
      const data = await response.json();
      setPostMedia(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch WordPress media:", error);
      throw error;
    }
  };

  const fetchAdditionalData = async () => {
    try {
      const [
        fetchedPricingFilter,
        fetchedCfCategory,
        fetchedDemo1,
      ] = await Promise.all([
        fetchWordPressData(`${url}/wp-json/wp/v2/pricing_filter`, setPricingFilterData),
        fetchWordPressData(`${url}/wp-json/wp/v2/cf_category`, setCfCategoryData),
        fetchWordPressData(`${url}/wp-json/wp/v2/demo1`, setDemo1Data),
      ]);

      return {
        fetchedPricingFilter,
        fetchedCfCategory,
        fetchedDemo1,
      };
    } catch (error) {
      console.error("Failed to fetch additional WordPress data:", error);
      throw error;
    }
  };

  const fetchAllWordPressData = async () => {
    try {
      const [
        fetchedPost,
        fetchedApp,
        fetchedPage,
        fetchedAgency,
        fetchedAttachment,
        fetchedServices,
        fetchedPostData,
        fetchedPageData,
        fetchedAppData,
        fetchedPostMedia,
        additionalData,
      ] = await Promise.all([
        fetchWordPressData(`${url}/wp-json/custom/v1/posts/post`, setPost),
        fetchWordPressData(`${url}/wp-json/custom/v1/posts/app`, setApp),
        fetchWordPressData(`${url}/wp-json/custom/v1/posts/page`, setPage),
        fetchWordPressData(`${url}/wp-json/custom/v1/posts/agency`, setAgency),
        fetchWordPressData(`${url}/wp-json/custom/v1/posts/attachment`, setAttachment),
        fetchWordPressData(`${url}/wp-json/custom/v1/posts/services`, setServices),
        fetchAllWordPressPosts(),
        fetchAllWordPressPages(),
        fetchAllWordPressApps(),
        fetchAllWordPressMedia(),
        fetchAdditionalData(),
      ]);

      const transformedData = {
        wordpressWebsiteUrl: url,
        post: fetchedPost,
        app: fetchedApp,
        page: fetchedPage,
        agency: fetchedAgency,
        attachment: fetchedAttachment,
        services: fetchedServices,
        pricingFilterData: additionalData.fetchedPricingFilter,
        cfCategoryData: additionalData.fetchedCfCategory,
        demo1Data: additionalData.fetchedDemo1,
        postMedia: fetchedPostMedia,
        postData: [...fetchedPostData],
        pageData: [...fetchedPageData],
        appData: [...fetchedAppData],
        connectionSuccessful: true,
        dataExtracted: true,
      };

      await submitDataToBackend(transformedData);
    } catch (error) {
      console.log(error);
    }
    setShowModal(false);
    window.location.reload();
  };

  const submitDataToBackend = async (transformedData) => {
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      if (!transformedData.post || !transformedData.app) {
        throw new Error("Failed to fetch data. Post or App is null.");
      }

      const response = await fetch("/api/sites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: transformedData }),
      });
      if (!response.ok) throw new Error("Failed to submit data");

      setConnectionSuccessful(true);
      setDataExtracted(true);
      setAddedUrls([...addedUrls, url]);
    } catch (error) {
      setSubmissionError(error.message);
      alert("Failed to fetch data. Please check your URL and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidHttpUrl(url)) {
      setIsValidUrl(false);
      return;
    }

    if (addedUrls.includes(url)) {
      alert("This URL is already added.");
      return;
    }

    fetchAllWordPressData();
  };

  const handleUrlChange = (e) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    setIsValidUrl(isValidHttpUrl(inputUrl));
  };

  const isValidHttpUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  return (
    <ModalLayout onClose={() => setShowModal(false)} labelledBy="title" as="form" onSubmit={handleSubmit}>
      <ModalHeader>
        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
          Add site
        </Typography>
      </ModalHeader>
      <ModalBody>
        <TextInput
          placeholder="Enter the URL to fetch data from the WordPress"
          label="URL"
          name="text"
          onChange={handleUrlChange}
          value={url}
          error={!isValidUrl && "Please enter a valid URL"}
        />
      </ModalBody>
      <ModalFooter
        startActions={
          <Button onClick={() => setShowModal(false)} variant="tertiary">
            Cancel
          </Button>
        }
        endActions={
          <Button type="submit" disabled={!isValidUrl || isSubmitting}>
            {isSubmitting ? "Adding..." : "Add site"}
          </Button>
        }
      />
    </ModalLayout>
  );
};

export default SiteModal;
