import useApi from "../../hooks/useApi";
import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { TextField } from "@mui/material";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import { Link } from "react-router-dom";
import ReplyIcon from "@mui/icons-material/Reply";
import IconButton from "@mui/material/IconButton";
import CommentIcon from "@mui/icons-material/Comment";
import { CircularProgress } from "@mui/material";
import { useContext } from "react";
import { UserContext } from "../../contexts/userContext";

export default function Comments({ id }) {
  const { user } = useContext(UserContext);
  const [comment, setComment] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);
  const {
    data: comments,
    loading,
    request,
  } = useApi({
    url: `/comment/recipe/${id}`,
  });

  useEffect(() => {
    request();
  }, []);

  async function toggleComment() {
    try {
      if (selectedComment == "none") {
        setSelectedComment(null);
      } else if (selectedComment) {
        setSelectedComment("none");
      } else if (!selectedComment) {
        setSelectedComment("none");
      }
      setComment({ comment: "", replyTo: null });
    } catch (error) {
      console.error(error);
    }
  }

  async function replyComment(e) {
    try {
      const targetValue = e.target.value;

      if (targetValue == selectedComment) {
        setSelectedComment(null);
      } else if (selectedComment) {
        setSelectedComment(targetValue);
      } else if (!selectedComment) {
        setSelectedComment(targetValue);
      }
      setComment({ comment: "", replyTo: null });
    } catch (error) {
      console.error(error);
    }
  }

  const {
    data: newComment,
    loading: newCommentLoading,
    request: sendCommentRequest,
    success,
  } = useApi({
    url: `/comment/${id}`,
    method: "post",
    body: comment,
  });

  async function sendComment(e) {
    try {
      const targetValue = e.target.value;
      setComment({ comment: comment, replyTo: null });

      if (targetValue == "none") {
        setComment({ comment: comment, replyTo: null });
      } else if (targetValue) {
        setComment({ comment: comment, replyTo: targetValue });
      }

      await sendCommentRequest();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    async function handleNewComment() {
      if (success) {
        setComment({ comment: "", replyTo: null });

        const newCommentObject = {
          comment_id: newComment.comment_id,
          comment: newComment.comment,
          user_id: newComment.user_id,
          username: user.username,
        };

        comments.push(newCommentObject);
      }
    }
    handleNewComment();
  }, [newComment]);

  if (loading) {
    return <Typography variant="h5">Loading...</Typography>;
  }

  const commentBox = (
    <Stack>
      <TextField
        label="Comment"
        multiline
        rows={4}
        value={comment?.comment}
        onChange={(e) => setComment({ comment: e.target.value, replyTo: null })}
        id="none"
      />
      <Button onClick={sendComment}>Submit</Button>
      {newCommentLoading && <CircularProgress />}
    </Stack>
  );

  const replyBox = (
    <Stack>
      <TextField
        label="Comment"
        multiline
        rows={4}
        value={comment?.comment}
        onChange={(e) =>
          setComment({ comment: e.target.value, replyTo: selectedComment })
        }
        id={selectedComment}
      />
      <Button onClick={sendComment}>Submit</Button>
      {newCommentLoading && <CircularProgress />}
    </Stack>
  );

  return (
    <Container
      sx={{
        marginTop: "5rem",
      }}
    >
      <Stack>
        <IconButton onClick={toggleComment}>
          <CommentIcon />
        </IconButton>

        {selectedComment == "none" && commentBox}
      </Stack>

      {comments?.map((item, index) => (
        <Stack
          key={index}
          sx={{
            padding: "1rem",
          }}
        >
          <Typography
            variant="h6"
            component={Link}
            to={`/user/${item.user_id}`}
            sx={{
              textDecoration: "none",
              color: "inherit",
              fontWeight: 700,
            }}
          >
            {item.username}
          </Typography>
          <Typography variant="p">{item.comment}</Typography>

          <IconButton value={item.comment_id} onClick={replyComment}>
            <ReplyIcon />
          </IconButton>
          {selectedComment == item.comment_id && replyBox}
        </Stack>
      ))}
    </Container>
  );
}
