import { Link } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";

export default function NotFound() {
  return (
    <Container
      sx={{
        display: "flex",
        height: "100%",
        paddingTop: "20vh",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <Typography variant="h1">404</Typography>
      <Stack
        spacing={2}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h4">Page not found</Typography>
        <Button component={Link} to="/">
          Go Home
        </Button>
      </Stack>
    </Container>
  );
}
