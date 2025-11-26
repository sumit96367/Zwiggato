# Zomato Dataset Import

This directory should contain the Zomato restaurant dataset files.

## Downloading the Dataset

### Option 1: Using Kaggle API (Recommended)

1. **Install Kaggle API:**
   ```bash
   pip install kaggle
   ```

2. **Set up Kaggle credentials:**
   - Go to https://www.kaggle.com/account
   - Click "Create New API Token"
   - This downloads `kaggle.json`
   - Place it in `~/.kaggle/kaggle.json` (Linux/Mac) or `C:\Users\<username>\.kaggle\kaggle.json` (Windows)

3. **Download the dataset:**
   ```bash
   kaggle datasets download -d snapshots/zomato-restaurants-data
   ```

4. **Extract and place files:**
   - Extract the downloaded zip file
   - Place `zomato.csv` or `zomato.json` in this directory (`backend/data/`)

### Option 2: Manual Download

1. Go to https://www.kaggle.com/datasets/snapshots/zomato-restaurants-data
2. Sign in to Kaggle (free account required)
3. Click "Download" button
4. Extract the zip file
5. Copy `zomato.csv` or `zomato.json` to this directory

## Dataset Information

- **Source:** Kaggle - Zomato Restaurants Data
- **Format:** CSV or JSON
- **Fields:** Restaurant names, locations, cuisines, average cost, ratings, delivery availability
- **Size:** Varies (typically contains thousands of restaurants)

## Importing the Data

Once you have the dataset file in this directory, run:

```bash
# Using Docker
docker-compose exec backend npm run import:zomato

# Or locally
cd backend
npm run import:zomato
```

The script will:
- Parse the CSV/JSON file
- Map Zomato data fields to our database schema
- Create restaurants with proper locations, ratings, and cuisines
- Generate sample menu items for each restaurant
- Import up to 50 restaurants (configurable in the script)

## Expected File Structure

```
backend/
  data/
    zomato.csv       # OR
    zomato.json      # Either CSV or JSON format
```

## Notes

- The script automatically maps Zomato cuisine types to our schema
- Sample menu items are generated based on cuisine type
- Only restaurants with valid data are imported
- Default limit is 50 restaurants (modify script to import more)

