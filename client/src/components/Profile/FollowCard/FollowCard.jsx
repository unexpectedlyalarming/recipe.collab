import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CardHeader,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../../contexts/userContext";

import useApi from "../../../hooks/useApi";
import { useState } from "react";
import Button from "@mui/material/Button";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonAddDisabledIcon from "@mui/icons-material/PersonAddDisabled";
import Stack from "@mui/material/Stack";

export default function FollowCard({ user }) {
  const { user: currentUser } = useContext(UserContext);
  const isInitFollowing = user?.followers?.some(
    (follower) => follower.follower_id === currentUser?.user_id
  );

  const [isFollowing, setIsFollowing] = useState(isInitFollowing);
  const [followers, setFollowers] = useState(user?.followers?.length);

  const { request } = useApi({
    url: `/follower/${user?.user_id}`,
    method: "put",
  });

  async function handleFollow() {
    try {
      const isNowFollowing = await request();
      setIsFollowing(isNowFollowing);
      isNowFollowing
        ? setFollowers(followers + 1)
        : setFollowers(followers - 1);
    } catch (error) {
      console.log(error);
    }
  }

  const followerButton = isFollowing ? (
    <Button
      variant="contained"
      color="primary"
      onClick={handleFollow}
      startIcon={<PersonAddDisabledIcon />}
    >
      Unfollow
    </Button>
  ) : (
    <Button
      variant="contained"
      color="primary"
      onClick={handleFollow}
      startIcon={<PersonAddIcon />}
    >
      Follow
    </Button>
  );

  return (
    <Stack spacing={2} direction="row">
      <Card>
        <CardHeader title="Followers" />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            {followers}
          </Typography>
        </CardContent>
        <CardActions>{followerButton}</CardActions>
      </Card>

      <Card>
        <CardHeader title="Following" />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            {user?.following?.length}
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
