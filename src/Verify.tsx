import { Button } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";

export const Verify = () => {
    const [message, setMessage] = useState("");
    const handleVerify = async () => {
        const token = sessionStorage.getItem("jwt");
        const response = await fetch("http://localhost:90/users/verify", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (response.status == 401) {
            alert("JWT Verification Falied");
            setMessage("");
        }
        if (response.status == 200){
            setMessage(await response.text());
        }
        else {
            alert("Something went wrong");
        }
    }

    return (
        <>  
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                Verify JWT
                <Button onClick={() => {
                    sessionStorage.clear()
                }}>
                Logout
                </Button>
            </div>
            <Button
                color="primary"
                variant="contained"
                fullWidth
                onClick={() => handleVerify()}>
                Verify
            </Button>
            <Box>
                {message}
            </Box>

        </>
    )
}