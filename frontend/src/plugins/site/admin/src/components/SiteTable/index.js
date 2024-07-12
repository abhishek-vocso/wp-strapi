// @ts-nocheck
import React from "react";
import {
  Table,
  Thead,
  TFooter,
  Tbody,
  Tr,
  Td,
  Th,
} from "@strapi/design-system/Table";
import { Box } from "@strapi/design-system/Box";
import { Flex } from "@strapi/design-system/Flex";
import { Button } from "@strapi/design-system/Button";
import { Typography } from "@strapi/design-system/Typography";
import { IconButton } from "@strapi/design-system/IconButton";
import { VisuallyHidden } from "@strapi/design-system/VisuallyHidden";
import Trash from "@strapi/icons/Trash";
import Plus from "@strapi/icons/Plus";

function SiteTable({ siteData, deleteSite, setShowModal }) {
  async function handleDelete(id) {
    const confirmed = window.confirm("Are you sure you want to delete this site?");
    if (confirmed) {
      try {
        const response = await fetch(`/api/sites/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete site");
        }
        // Update the state to reflect the deletion
        window.location.reload();
      } catch (error) {
        console.error("Error deleting site:", error);
      }
    }
  }
  

  return (
    <Box
      background="neutral0"
      hasRadius={true}
      shadow="filterShadow"
      padding={8}
      style={{ marginTop: "10px" }}
    >
      <Table
        colCount={4}
        rowCount={10}
        footer={
          <TFooter onClick={() => setShowModal(true)} icon={<Plus />}>
            Add a site
          </TFooter>
        }
      >
        <Thead>
          <Tr>
            <Th>
              <Typography variant="sigma">ID</Typography>
            </Th>

            <Th>
              <Typography variant="sigma">Website URL</Typography>
            </Th>

            <Th>
              <Typography variant="sigma">Status</Typography>
            </Th>

            <Th>
              <Typography variant="sigma">Action</Typography>
            </Th>

          </Tr>
        </Thead>

        <Tbody>
          {siteData?.data?.map((site) => (
            <Tr key={site.id}>
              <Td>
                <Typography textColor="neutral800">{site.id}</Typography>
              </Td>

              <Td>
               <a href={`site/wordpress/${site.id}`} style={{ textDecoration: "none"}}> <Typography textColor="neutral800" >{site?.attributes?.wordpressWebsiteUrl}</Typography>
               </a>
              </Td>

              <Td>
                <p>Data fetched Successfully</p>
              </Td>

              <Td>
                <Flex style={{ justifyContent: "center" }}>
                  <IconButton
                    onClick={() => handleDelete(site.id)}
                    label="Delete"
                    noBorder
                    icon={<Trash />}
                  />
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}

export default SiteTable;
