# Importing Zomato Dataset

This guide explains how to import real-world restaurant data from the Zomato dataset available on Kaggle.

## Prerequisites

1. **Kaggle Account** (free)
   - Sign up at https://www.kaggle.com
   
2. **Kaggle API Setup**
   - Install: `pip install kaggle`
   - Get API token from https://www.kaggle.com/account
   - Place `kaggle.json` in:
     - Linux/Mac: `~/.kaggle/kaggle.json`
     - Windows: `C:\Users\<username>\.kaggle\kaggle.json`

## Step 1: Download the Dataset

### Using Kaggle API (Recommended)

```bash
# Install Kaggle CLI
pip install kaggle

# Download the dataset
kaggle datasets download -d snapshots/zomato-restaurants-data

# Extract the zip file
unzip zomato-restaurants-data.zip  # Linux/Mac
# or
Expand-Archive zomato-restaurants-data.zip  # Windows PowerShell
```

### Manual Download

1. Visit: https://www.kaggle.com/datasets/snapshots/zomato-restaurants-data
2. Click "Download" (requires Kaggle account)
3. Extract the zip file

## Step 2: Place the Data File

Copy the dataset file to the backend data directory:

```bash
# Create data directory if it doesn't exist
mkdir -p backend/data

# Copy the file (use either CSV or JSON)
cp zomato.csv backend/data/
# or
cp zomato.json backend/data/
```

## Step 3: Install Dependencies

The import script requires `csv-parser` package:

```bash
# If using Docker
docker-compose exec backend npm install csv-parser

# Or locally
cd backend
npm install csv-parser
```

## Step 4: Run the Import

```bash
# Using Docker
docker-compose exec backend npm run import:zomato

# Or locally
cd backend
npm run import:zomato
```

## What Gets Imported

The script will:
- ✅ Parse restaurant data from CSV/JSON
- ✅ Map Zomato fields to our schema:
  - Restaurant names and descriptions
  - Locations and addresses
  - Cuisine types
  - Ratings and reviews
  - Average costs
- ✅ Create restaurants in MongoDB
- ✅ Generate sample menu items for each restaurant
- ✅ Import up to 50 restaurants (configurable)

## Data Mapping

| Zomato Field | Our Schema Field |
|-------------|------------------|
| `name` / `Restaurant Name` | `name` |
| `cuisines` / `Cuisines` | `cuisineType` |
| `Aggregate rating` / `rate` | `rating` |
| `Votes` / `votes` | `totalReviews` |
| `Location` / `location` | `location.address` |
| `Average Cost for two` | `minimumOrder` (calculated) |

## Customization

To import more restaurants, edit `backend/src/scripts/importZomato.js`:

```javascript
// Change this line (around line 200)
const restaurantsToImport = restaurants.slice(0, 50); // Change 50 to desired number
```

## Troubleshooting

### "No data file found"
- Ensure `zomato.csv` or `zomato.json` is in `backend/data/` directory
- Check file permissions

### "No restaurants found in data file"
- Verify the file format matches expected structure
- Check if file is corrupted or empty

### Import errors
- Check MongoDB connection
- Verify file encoding (should be UTF-8)
- Review console logs for specific error messages

## Benefits of Using Zomato Data

- ✅ Real-world restaurant names and locations
- ✅ Actual customer ratings and reviews
- ✅ Authentic cuisine types
- ✅ Realistic pricing data
- ✅ Large dataset (thousands of restaurants)

## Alternative: Use Sample Data

If you prefer to use sample data instead:

```bash
docker-compose exec backend npm run seed
```

This uses the built-in seed script with 5 sample restaurants.

