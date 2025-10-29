import { Button } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";
import { submit } from "./utils/submit";

export const Verify = () => {
  const [message, setMessage] = useState<string>("");
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        Verify JWT
        <Button
          onClick={() => {
            sessionStorage.clear();
          }}
        >
          Logout
        </Button>
      </div>
      <Button
        color="primary"
        variant="contained"
        fullWidth
        onClick={() => submit(setMessage)}
      >
        Verify
      </Button>
      <Box>{message}</Box>
    </>
  );
};
