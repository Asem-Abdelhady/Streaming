import { Button, Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// TODO: Fetch these from BE
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

export default function SelectClasses() {
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({});
  const navigate = useNavigate();

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
    console.log(Object.keys(checkedItems).filter((item) => checkedItems[item]));
    // Here we send api request when we have the URL
    navigate("/stream");
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormGroup>
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
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </form>
  );
}
