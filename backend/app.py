import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# 1️⃣ Load the dataset (Ensure your dataset is named 'products.csv')
df = pd.read_csv("./dataset/Dataset.csv")

# 2️⃣ Preprocess missing values
df['description'] = df['description'].fillna("")

# 3️⃣ Convert descriptions into numerical features using TF-IDF
vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(df['description'])

# 4️⃣ Compute cosine similarity between products
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

# 5️⃣ Function to get top N similar products
def recommend_products(product_name, top_n=5):
    if product_name not in df['name'].values:
        return "Product not found!"

    # Get index of the selected product
    idx = df[df['name'] == product_name].index[0]

    # Get similarity scores for all products
    sim_scores = list(enumerate(cosine_sim[idx]))

    # Sort products based on similarity score
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    # Get top N similar products (excluding the first one, which is itself)
    sim_scores = sim_scores[1:top_n+1]

    # Get product indices
    product_indices = [i[0] for i in sim_scores]

    # Return recommended products
    return df.iloc[product_indices][['name', 'brand', 'price', 'image_url']]

# 🔥 Example: Get recommendations for "MacBook Pro M3"
print(recommend_products("MacBook Air M2"))
