import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function Footer() {
  return (
    <Container>
      <Divider
        sx={{
          margin: "2rem",
        }}
      />

      <Stack spacing={4}>
        <Typography
          variant="p"
          sx={{
            textAlign: "center",
          }}
        >
          Recipe Site &copy; 2024
        </Typography>
      </Stack>

      <Divider
        sx={{
          margin: "2rem",
        }}
      />
    </Container>
  );
}
