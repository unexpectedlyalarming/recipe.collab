import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { forwardRef, useRef, useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import Stack from "@mui/material/Stack";
import { CircularProgress } from "@mui/material";
import _ from "lodash";
import SERVER_URL from "../../../vars/server_url";

export default function TagEditor({ inputTags, setParentTags }) {
  //Tags are our local data from the user
  const [tags, setTags] = useState(inputTags ? inputTags : []);
  const [loading, setLoading] = useState(true);
  //Our query is the input value from the user
  const [query, setQuery] = useState("");
  // Our fetched tags are the tags we get from the server
  const [fetchedTags, setFetchedTags] = useState([]);

  const [inputValue, setInputValue] = useState("");
  const autocompleteRef = useRef();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setParentTags(tags);
  }, [tags]);

  const limit = 10;
  const page = 1;

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${SERVER_URL}/recipe/tags/${page}/${limit}/${query}`)
      .then((res) => {
        const data = res.data;
        setFetchedTags(data);

        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [query]);

  function addTag(tag) {
    tag = _.capitalize(tag);
    setTags([...tags, tag]);
  }

  function deleteTag(tag) {
    setTags(tags.filter((item) => item.tag !== tag.tag));
  }
  useEffect(() => {
    if (autocompleteRef.current) {
      const input = autocompleteRef.current.querySelector("input");
      if (input) {
        input.focus();
      }
    }
  }, [fetchedTags]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Stack spacing={2}>
      <Autocomplete
        ref={autocompleteRef}
        options={
          fetchedTags && fetchedTags.length > 0
            ? fetchedTags.filter(
                (option) => !tags.find((tag) => tag.tag === option.tag)
              )
            : []
        }
        multiple
        id="tags-standard"
        getOptionSelected={(option, value) => option?.tag === value?.tag}
        getOptionLabel={(option) => option.tag}
        filterSelectedOptions
        freeSolo
        open={open}
        value={tags}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label="Tags"
            placeholder="Tags"
          />
        )}
        inputValue={inputValue}
        onInputChange={(event, newInputValue, reason) => {
          if (reason === "input") {
            setInputValue(newInputValue);
            setQuery(newInputValue);
          }
        }}
        onChange={(event, newValue) => {
          let newTags;
          if (typeof newValue[newValue.length - 1] === "string") {
            const newTag = _.capitalize(newValue[newValue.length - 1].trim());
            if (!tags.find((tag) => tag.tag === newTag)) {
              newTags = [...newValue.slice(0, -1), { tag: newTag }];
            } else {
              newTags = [...newValue.slice(0, -1)];
            }
          } else {
            newTags = newValue;
          }
          setTags(newTags);
        }}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              key={option.tag}
              variant="outlined"
              label={option.tag}
              {...getTagProps({ index })}
            />
          ))
        }
      />
    </Stack>
  );
}
