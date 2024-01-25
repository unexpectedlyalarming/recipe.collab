import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Image from "mui-image";
import SettingsIcon from "@mui/icons-material/Settings";
import { useParams } from "react-router-dom";
import useApi from "../../hooks/useApi";
import { useEffect } from "react";
import Loading from "../Loading/Loading";
import { useContext } from "react";
import { UserContext } from "../../contexts/userContext";
import Badge from "@mui/material/Badge";
import FollowCard from "../../components/Profile/FollowCard/FollowCard";
import ProfileRecipes from "./Recipes/ProfileRecipes";
import Divider from "@mui/material/Divider";
export default function Profile() {
  const { id } = useParams();

  const { user: currentUser } = useContext(UserContext);

  const {
    data: user,
    loading,
    success,
    request,
  } = useApi({
    url: `/user/${id}`,
  });

  useEffect(() => {
    async function getUser() {
      await request();
    }
    getUser();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (!success) {
    return <Typography variant="h4">User not found</Typography>;
  }

  return (
    <Container>
      <Stack
        spacing={2}
        sx={{
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <Badge
          variant="dot"
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          color={user?.is_active ? "success" : "error"}
        >
          <Image
            src={user?.profile_pic}
            alt="avatar"
            width={100}
            height={100}
            sx={{
              borderRadius: "50%",
            }}
          />
        </Badge>

        <Typography variant="h5">
          {user?.first_name} {user?.last_name}
        </Typography>
        <Typography variant="h6">{user?.username}</Typography>
        <Typography variant="body1">{user?.bio}</Typography>
        <Typography variant="body1">
          Joined {user?.created_at.split("T", 1)}
        </Typography>
        <FollowCard user={user} />
        {currentUser?.user_id === user?.user_id && (
          <Button variant="outlined" startIcon={<SettingsIcon />}>
            Edit Profile
          </Button>
        )}
      </Stack>
      <Divider />
      <ProfileRecipes recipes={user?.recipes} />
    </Container>
  );
}
