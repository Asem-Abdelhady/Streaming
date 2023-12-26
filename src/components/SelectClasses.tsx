import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  styled,
} from "@mui/material";
import { useState } from "react";

const classes = [
  "person",
  "bicycle",
  "car",
  "motorcycle",
  "airplane",
  "bus",
  "train",
  "truck",
  "boat",
  "traffic light",
  "fire hydrant",
  "stop sign",
  "parking meter",
  "bench",
  "bird",
  "cat",
  "dog",
  "horse",
  "sheep",
  "cow",
  "elephant",
  "bear",
  "zebra",
  "giraffe",
  "backpack",
  "umbrella",
  "handbag",
  "tie",
  "suitcase",
  "frisbee",
  "skis",
  "snowboard",
  "sports ball",
  "kite",
  "baseball bat",
  "baseball glove",
  "skateboard",
  "surfboard",
  "tennis racket",
  "bottle",
  "wine glass",
  "cup",
  "fork",
  "knife",
  "spoon",
  "bowl",
  "banana",
  "apple",
  "sandwich",
  "orange",
  "broccoli",
  "carrot",
  "hot dog",
  "pizza",
  "donut",
  "cake",
  "chair",
  "couch",
  "potted plant",
  "bed",
  "dining table",
  "toilet",
  "tv",
  "laptop",
  "mouse",
  "remote",
  "keyboard",
  "cell phone",
  "microwave",
  "oven",
  "toaster",
  "sink",
  "refrigerator",
  "book",
  "clock",
  "vase",
  "scissors",
  "teddy bear",
  "hair drier",
  "toothbrush",
];

interface CheckedItems {
  [key: string]: boolean;
}

type Props = {
  onSelectedObjectsChange: (selectedItems: string[]) => void;
};

export default function SelectClasses({ onSelectedObjectsChange }: Props) {
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({});

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckedItems: CheckedItems = classes.reduce(
      (acc: CheckedItems, item) => {
        acc[item] = event.target.checked;
        return acc;
      },
      {}
    );
    setCheckedItems(newCheckedItems);
  };

  const handleCheckboxChange =
    (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setCheckedItems({ ...checkedItems, [name]: event.target.checked });
    };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const selectedObjects = Object.keys(checkedItems).filter(
      (item) => checkedItems[item]
    );

    onSelectedObjectsChange(selectedObjects);
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormGroup sx={{ maxHeight: "60%" }}>
        <FormControlLabel
          control={<Checkbox onChange={handleSelectAll} />}
          label="Select All"
        />
        {classes.map((item) => (
          <FormControlLabel
            key={item}
            control={
              <Checkbox
                checked={checkedItems[item] || false}
                onChange={handleCheckboxChange(item)}
              />
            }
            label={item}
          />
        ))}
      </FormGroup>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ width: "60%", alignSelf: "center" }}
      >
        Submit
      </Button>
    </FormContainer>
  );
}

const FormContainer = styled("form")`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  row-gap: 12px;
  padding: 24px;
`;
