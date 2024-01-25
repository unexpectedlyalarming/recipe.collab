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
  const [selectedComment, setSelectedComment] = useState("none");
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
      } else {
        setSelectedComment("none");
      }
      setComment({ comment: "", reply_to: null });
    } catch (error) {
      console.error(error);
    }
  }

  async function replyComment(commentId) {
    try {
      if (commentId == selectedComment) {
        setSelectedComment(null);
      } else {
        setSelectedComment(commentId);
      }
      setComment({ comment: "", reply_to: null });
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
      setComment({ comment: comment, reply_to: null });

      if (targetValue == "none") {
        setComment({ comment: comment, reply_to: null });
      } else if (targetValue) {
        setComment({ comment: comment, reply_to: targetValue });
      }

      await sendCommentRequest();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    async function handleNewComment() {
      if (success) {
        setComment({ comment: "", reply_to: null });

        const newCommentObject = {
          comment_id: newComment.comment_id,
          comment: newComment.comment,
          user_id: newComment.user_id,
          username: user.username,
          reply_to: newComment.reply_to,
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
        onChange={(e) =>
          setComment({ comment: e.target.value, reply_to: null })
        }
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
          setComment({ comment: e.target.value, reply_to: selectedComment })
        }
        id={selectedComment?.toString()}
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
      <Stack
        sx={{
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
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
          {item.reply_to && (
            <Typography variant="p">
              Replying to:{" "}
              <Typography
                variant="p"
                component={Link}
                to={`/user/${item.reply_to}`}
                sx={{
                  textDecoration: "none",
                  color: "inherit",
                  fontWeight: 700,
                }}
              >
                {item?.reply_to_username}
              </Typography>
            </Typography>
          )}
          <Typography variant="p">{item.comment}</Typography>
          <Stack direction="row">
            <IconButton onClick={() => replyComment(item.comment_id)}>
              <ReplyIcon />
            </IconButton>
          </Stack>
          {selectedComment == item.comment_id && replyBox}
        </Stack>
      ))}
    </Container>
  );
}
