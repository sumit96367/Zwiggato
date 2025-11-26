# Quick Start: Import Zomato Dataset

## 🚀 Quick Setup (3 Steps)

### Step 1: Download Dataset from Kaggle

**Option A: Using Kaggle API (Recommended)**
```powershell
# Install Kaggle CLI
pip install kaggle

# Download dataset
kaggle datasets download -d snapshots/zomato-restaurants-data

# Extract (PowerShell)
Expand-Archive zomato-restaurants-data.zip -DestinationPath .
```

**Option B: Manual Download**
1. Go to: https://www.kaggle.com/datasets/snapshots/zomato-restaurants-data
2. Sign in (free account)
3. Click "Download"
4. Extract the zip file

### Step 2: Place File in Project

Copy the dataset file to:
```
backend/data/zomato.csv
```
or
```
backend/data/zomato.json
```

### Step 3: Run Import

```powershell
# Install dependencies (if not already installed)
docker-compose exec backend npm install csv-parser

# Run import
docker-compose exec backend npm run import:zomato
```

## ✅ That's It!

The script will:
- Import up to 50 restaurants from Zomato dataset
- Map real restaurant data (names, locations, ratings, cuisines)
- Create sample menu items for each restaurant
- Replace existing data in database

## 📊 What You Get

- **Real restaurant names** from Zomato
- **Actual ratings** and review counts
- **Real cuisine types** (Indian, Chinese, Italian, etc.)
- **Location data** (addresses, cities)
- **Realistic pricing** based on average costs

## 🔧 Customization

To import more restaurants, edit `backend/src/scripts/importZomato.js`:
```javascript
const restaurantsToImport = restaurants.slice(0, 50); // Change 50 to your desired number
```

## 📝 Notes

- The script automatically maps Zomato fields to our schema
- Sample menu items are generated based on cuisine type
- Only valid restaurants are imported (skips invalid data)
- Default limit: 50 restaurants (for performance)

## 🆘 Troubleshooting

**"No data file found"**
- Ensure `zomato.csv` or `zomato.json` is in `backend/data/` folder
- Check file name matches exactly

**"No restaurants found"**
- Verify file format (CSV or JSON)
- Check file encoding (should be UTF-8)

**Import errors**
- Check MongoDB is running: `docker-compose ps`
- Review logs: `docker-compose logs backend`

## 📚 Full Documentation

See `docs/ZOMATO_IMPORT.md` for detailed instructions.

