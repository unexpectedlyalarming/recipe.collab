import Container from "@mui/material/Container";
import { CircularProgress } from "@mui/material";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function Loading() {
  return (
    <Container
      sx={{
        display: "flex",
        height: "100%",
        paddingTop: "20vh",
        alignItems: "start",
        justifyContent: "center",
      }}
    >
      <Stack
        spacing={2}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h4">Loading</Typography>
        <CircularProgress />
      </Stack>
    </Container>
  );
}
