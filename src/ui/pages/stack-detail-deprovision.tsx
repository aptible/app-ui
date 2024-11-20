import { useQuery, useSelector } from "@app/react";
import classNames from "classnames";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Group,
  tokens,
} from "../shared";

export const StackDetailDeprovisionPage = () => {

  return (
    <Group>
      <Group size="sm">
        <Box className="mb-4">
          <div className="flex justify-between items-start">
            <p className="flex mb-4 text-gray-500 text-md">
              Contact support to edit or add new VPC Peers.
            </p>
          </div>
          <Link
            className="hover:no-underline"
            to="https://www.aptible.com/docs/support"
          >
            <Button className="font-semibold">Contact Support</Button>
          </Link>
        </Box>
    </Group>
  );
};
