import { Stack, styled } from "@mui/material";

export default function Stream() {
  return (
    <Stack sx={{ height: "100%" }}>
      <StreamContainer>TODO: Stream</StreamContainer>
      <ObjectsContainer>TODO: Objects</ObjectsContainer>
    </Stack>
  );
}

const StreamContainer = styled("div")`
  height: 80%;
`;

const ObjectsContainer = styled("div")`
  flex: 1;
`;
