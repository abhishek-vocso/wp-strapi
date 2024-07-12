// @ts-nocheck
import React, { memo, useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { BaseHeaderLayout, ContentLayout } from "@strapi/design-system/Layout";
import { EmptyStateLayout } from "@strapi/design-system/EmptyStateLayout";
import { Illo } from "../../components/Illo";
import { Button } from "@strapi/design-system/Button";
import Plus from "@strapi/icons/Plus";

import SiteModal from "../../components/SiteModal";
import SiteCount from "../../components/SiteCount";
import SiteTable from "../../components/SiteTable";

// import PropTypes from 'prop-types';

const HomePage = () => {
  const [siteData, setSiteData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSites();
  }, []);

  async function fetchSites() {
    try {
      const response = await fetch("/api/sites");
      if (!response.ok) {
        throw new Error("Failed to fetch sites");
      }
      const data = await response.json();
      setSiteData(data);
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  }

  async function addSite(data) {
    setSiteData([...siteData, { ...data, id: nanoid() }]);
  }

  async function deleteSite(id) {
    setSiteData(siteData.filter((site) => site.id !== id));
  }

  return (
    <>
      <BaseHeaderLayout
        title="Wp Strapi Migrate"
        subtitle="All your sites in one place."
        as="h2"
      />

      <ContentLayout>
        {siteData?.data?.length === 0 ? (
          <EmptyStateLayout
            icon={<Illo />}
            content="You don't have any sites yet..."
            action={
              <Button
                onClick={() => setShowModal(true)}
                variant="secondary"
                startIcon={<Plus />}
              >
                Add your first site
              </Button>
            }
          />
        ) : (
          <>
            <SiteCount count={siteData?.data?.length} />
            <SiteTable
              siteData={siteData}
              deleteSite={deleteSite}
              setShowModal={setShowModal}
              setSiteData={setSiteData}
            />
          </>
        )}
      </ContentLayout>

      {showModal && <SiteModal setShowModal={setShowModal} addSite={addSite} setSiteData={setSiteData} />}
    </>
  );
};

export default memo(HomePage);
