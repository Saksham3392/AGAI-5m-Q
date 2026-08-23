// problems.js - Complete Question Dataset matching agai-10m-q.onrender.com

export const PROBLEMS = [
  {
    id: "q_exam1",
    number: 1,
    title: "Query Projection & Multi-Head Splitting",
    category: "Transformer Attention",
    difficulty: "Medium",
    tags: ["Exam Q", "Transformer", "Attention", "Query Projection"],
    hints: [
      "1. Calculate the projected query matrix using matrix multiplication: Q = X * Wq.",
      "2. Compute head_dim = d_model // num_heads. For each head h, slice columns from index h * head_dim to (h + 1) * head_dim.",
      "3. Return the 3D matrix in the shape [num_heads][sequence_length][head_dim]."
    ],
    description: `A multi-head attention layer first projects each input token into a query representation and then divides the projected features among multiple attention heads.

You are given:

* \`x\`, a matrix of token embeddings having shape \`sequence_length\` × \`d_model\`
* \`wq\`, a query projection matrix having shape \`d_model\` × \`d_model\`
* \`num_heads\`, the number of attention heads

First calculate the projected query matrix:

\`Q = X * Wq\`

Then divide each projected query vector into \`num_heads\` equal contiguous parts.

If \`d_model = 6\` and \`num_heads = 3\`, each attention head receives 2 features from every token.

Return the result in the form:

\`[num_heads][sequence_length][head_dim]\`

where:

\`head_dim = d_model // num_heads\`

You may assume that \`d_model\` is always divisible by \`num_heads\`.

Do not use NumPy or any external numerical library.`,
    functionName: "split_query_heads",
    starterCode: `# ====================================================================
# Header (Prewritten Imports & Helper Functions)
# ====================================================================
import json
import sys


def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)


# ====================================================================
# Body (Write your solution here)
# ====================================================================
def split_query_heads(x, wq, num_heads):
    # 1. Calculate Q = X * Wq.
    # 2. Determine head_dim.
    # 3. Divide each projected query vector into equal contiguous parts.
    # 4. Return [num_heads][sequence_length][head_dim].




# ====================================================================
# Tail (Prewritten Input Reader & Output Printer)
# ====================================================================
data = json.loads(sys.stdin.read().strip())

result = split_query_heads(
    data["x"],
    data["wq"],
    data["num_heads"]
)

print(
    json.dumps(
        clean_output(result),
        separators=(",", ":"),
    )
)
`,
    headerCode: `import json
import sys

def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)
`,
    tailCode: `data = json.loads(sys.stdin.read().strip())

result = split_query_heads(
    data["x"],
    data["wq"],
    data["num_heads"]
)

print(
    json.dumps(
        clean_output(result),
        separators=(",", ":"),
    )
)
`,
    solutionCode: `# ====================================================================
# Header (Prewritten Imports & Helper Functions)
# ====================================================================
import json
import sys


def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)


# ====================================================================
# Body (Write your solution here)
# ====================================================================
import numpy as np


def split_query_heads(x, wq, num_heads):
    # 1. Calculate Q = X * Wq.
    # 2. Determine head_dim.
    # 3. Divide each projected query vector into equal contiguous parts.
    # 4. Return [num_heads][sequence_length][head_dim].

    # Step 1: Project input representations into query space -> shape: (seq_len, d_model)
    Q = np.matmul(x, wq)

    # Extract sequence length and the full embedding/model dimension
    seq_len, d_model = Q.shape

    # Step 2: Compute the dimension allocated to each individual attention head
    head_dim = d_model // num_heads

    # Step 3: Reshape to split the embedding dimension into (num_heads, head_dim),
    # then swap axis 0 (seq_len) and axis 1 (num_heads) -> shape: (num_heads, seq_len, head_dim)
    heads = Q.reshape(seq_len, num_heads, head_dim).swapaxes(0, 1)

    # Step 4: Convert the NumPy array into nested Python lists and return
    return heads.tolist()




# ====================================================================
# Tail (Prewritten Input Reader & Output Printer)
# ====================================================================
data = json.loads(sys.stdin.read().strip())

result = split_query_heads(
    data["x"],
    data["wq"],
    data["num_heads"]
)

print(
    json.dumps(
        clean_output(result),
        separators=(",", ":"),
    )
)
`,
    testCases: [
      {
        id: "tc1",
        name: "Sample 1: 2 Tokens x Dim 4, 2 Heads",
        input: {
          x: [
            [1.0, 0.0, 1.0, 0.0],
            [0.0, 1.0, 0.0, 1.0]
          ],
          wq: [
            [1.0, 2.0, 0.0, 0.0],
            [0.0, 0.0, 1.0, 2.0],
            [2.0, 1.0, 0.0, 0.0],
            [0.0, 0.0, 2.0, 1.0]
          ],
          num_heads: 2
        },
        expectedOutput: [
          [
            [3.0, 3.0],
            [0.0, 0.0]
          ],
          [
            [0.0, 0.0],
            [3.0, 3.0]
          ]
        ],
        isSample: true
      },
      {
        id: "tc2",
        name: "Sample 2: 3 Tokens x Dim 2, 1 Head",
        input: {
          x: [
            [1.0, 2.0],
            [3.0, 4.0],
            [5.0, 6.0]
          ],
          wq: [
            [1.0, 0.0],
            [0.0, 1.0]
          ],
          num_heads: 1
        },
        expectedOutput: [
          [
            [1.0, 2.0],
            [3.0, 4.0],
            [5.0, 6.0]
          ]
        ],
        isSample: true
      },
      {
        id: "tc3",
        name: "Test 3: Single Token x Dim 6, 3 Heads",
        input: {
          x: [
            [1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
          ],
          wq: [
            [1.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 0.0, 0.0, 0.0],
            [0.0, 0.0, 1.0, 0.0, 0.0, 0.0],
            [0.0, 0.0, 0.0, 1.0, 0.0, 0.0],
            [0.0, 0.0, 0.0, 0.0, 1.0, 0.0],
            [0.0, 0.0, 0.0, 0.0, 0.0, 1.0]
          ],
          num_heads: 3
        },
        expectedOutput: [
          [
            [1.0, 1.0]
          ],
          [
            [1.0, 1.0]
          ],
          [
            [1.0, 1.0]
          ]
        ],
        isSample: false
      }
    ]
  },
  {
    id: "q_exam2",
    number: 2,
    title: "Residual Connection & Layer Normalization",
    category: "Transformer Architecture",
    difficulty: "Medium",
    tags: ["Exam Q", "Transformer", "Residuals", "LayerNorm"],
    hints: [
      "1. Add x and sublayer_output element-wise for each token: added = [a + b for a, b in zip(x_tok, sub_tok)].",
      "2. Pass the residual vector into the provided layer_norm(added, gamma, beta, eps) helper function.",
      "3. Process each token independently and return the list of normalized token representations."
    ],
    description: `Transformer encoder and decoder blocks use residual connections followed by layer normalization around their sublayers.

You are given:

* \`x\`: the input token representations
* \`sublayer_output\`: the output produced by an attention or feed-forward sublayer
* \`gamma\`: layer-normalization scale parameters
* \`beta\`: layer-normalization shift parameters
* \`eps\`: a small value used for numerical stability

For every token, first perform the residual addition:

\`residual = x + sublayer_output\`

Then apply layer normalization to the resulting token vector.

A helper function named \`layer_norm()\` is already provided.

Process each token independently and return the normalized token representations.`,
    functionName: "residual_layer_norm",
    starterCode: `import json
import sys
import math

def layer_norm(vector, gamma, beta, eps):
    mean = sum(vector) / len(vector)
    
    variance = 0.0
    
    for value in vector:
        variance += (value - mean) ** 2
        
    variance /= len(vector)
    
    denominator = math.sqrt(variance + eps)
    
    result = []
    
    for i in range(len(vector)):
        normalized = (vector[i] - mean) / denominator
        result.append(
            gamma[i] * normalized + beta[i]
        )
            
    return result

def clean_output(value):
    if isinstance(value, list):
        return [clean_output(item) for item in value]
        
    return round(float(value), 6)

def residual_layer_norm(
    x,
    sublayer_output,
    gamma,
    beta,
    eps
):
    # 1. Add x and sublayer_output for every token.
    # 2. Apply the supplied layer_norm() helper.
    # 3. Process every token independently.
    # 4. Return all normalized token representations.
    # Write your code here

data = json.loads(sys.stdin.read().strip())

result = residual_layer_norm(
    data["x"],
    data["sublayer_output"],
    data["gamma"],
    data["beta"],
    data["eps"]
)

print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    headerCode: `import json
import sys
import math

def layer_norm(vector, gamma, beta, eps):
    mean = sum(vector) / len(vector)
    
    variance = 0.0
    
    for value in vector:
        variance += (value - mean) ** 2
        
    variance /= len(vector)
    
    denominator = math.sqrt(variance + eps)
    
    result = []
    
    for i in range(len(vector)):
        normalized = (vector[i] - mean) / denominator
        result.append(
            gamma[i] * normalized + beta[i]
        )
            
    return result

def clean_output(value):
    if isinstance(value, list):
        return [clean_output(item) for item in value]
        
    return round(float(value), 6)
`,
    tailCode: `data = json.loads(sys.stdin.read().strip())

result = residual_layer_norm(
    data["x"],
    data["sublayer_output"],
    data["gamma"],
    data["beta"],
    data["eps"]
)

print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    solutionCode: `import json
import sys
import math

def layer_norm(vector, gamma, beta, eps):
    mean = sum(vector) / len(vector)
    
    variance = 0.0
    
    for value in vector:
        variance += (value - mean) ** 2
        
    variance /= len(vector)
    
    denominator = math.sqrt(variance + eps)
    
    result = []
    
    for i in range(len(vector)):
        normalized = (vector[i] - mean) / denominator
        result.append(
            gamma[i] * normalized + beta[i]
        )
            
    return result

def clean_output(value):
    if isinstance(value, list):
        return [clean_output(item) for item in value]
        
    return round(float(value), 6)

def residual_layer_norm(
    x,
    sublayer_output,
    gamma,
    beta,
    eps
):
    # 1. Add x and sublayer_output for every token.
    # 2. Apply the supplied layer_norm() helper.
    # 3. Process every token independently.
    # 4. Return all normalized token representations.
    output = []
    for x_tok, sub_tok in zip(x, sublayer_output):
        added = [a + b for a, b in zip(x_tok, sub_tok)]
        output.append(layer_norm(added, gamma, beta, eps))
    return output

data = json.loads(sys.stdin.read().strip())

result = residual_layer_norm(
    data["x"],
    data["sublayer_output"],
    data["gamma"],
    data["beta"],
    data["eps"]
)

print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    testCases: [
      {
        id: "tc1",
        name: "Sample 1: Single Token 3-dim",
        input: {
          x: [[1.0, 2.0, 3.0]],
          sublayer_output: [[0.5, 0.5, 0.5]],
          gamma: [1.0, 1.0, 1.0],
          beta: [0.0, 0.0, 0.0],
          eps: 1e-5
        },
        expectedOutput: [
          [-1.224736, 0.0, 1.224736]
        ],
        isSample: true
      },
      {
        id: "tc2",
        name: "Sample 2: 2 Tokens x 2-dim",
        input: {
          x: [
            [2.0, 4.0],
            [1.0, 3.0]
          ],
          sublayer_output: [
            [0.5, -0.5],
            [1.0, 0.0]
          ],
          gamma: [2.0, 0.5],
          beta: [1.0, -1.0],
          eps: 1e-6
        },
        expectedOutput: [
          [-0.999996, -0.500001],
          [-0.999996, -0.500001]
        ],
        isSample: true
      }
    ]
  },
  {
    id: "q1",
    number: 3,
    title: "Head-Specific Masked Attention",
    category: "Transformer Attention",
    difficulty: "Medium",
    tags: ["Multi-Head Attention", "Masking", "Softmax", "NumPy-Free"],
    hints: [
      "1. Iterate through each head independently. For each query position i, find permitted keys j where mask[h][i][j] == 1.",
      "2. Compute dot-product scores only for permitted keys: score = dot_product / sqrt(head_dim).",
      "3. Apply numerically stable softmax by subtracting max(scores), normalizing, and calculating the weighted sum of Value vectors."
    ],
    description: `A multi-head attention layer uses a separate binary permission mask for each attention head.

The Query, Key, and Value matrices are already separated into heads and have the form:
\`[num_heads][sequence_length][head_dim]\`

The mask has the form:
\`[num_heads][sequence_length][sequence_length]\`

For each head \`h\` and pair of positions \`i, j\`:
* \`mask[h][i][j] = 1\` means query \`i\` may attend to key \`j\` in that head.
* \`mask[h][i][j] = 0\` means that key position must be ignored.

**For every head independently:**
1. Compute dot-product scores only for permitted key positions.
2. Divide each permitted score by \`sqrt(head_dim)\`.
3. Apply a numerically stable softmax only across the permitted scores.
4. Use the resulting weights to calculate a weighted sum of the corresponding Value vectors.

Return the result without concatenating the heads in the form:
\`[num_heads][sequence_length][head_dim]\`

Every mask row contains at least one permitted key. Do not use NumPy, PyTorch, TensorFlow, or another machine learning library.`,
    functionName: "head_specific_masked_attention",
    starterCode: `# ====================================================================
# Header (Prewritten Imports & Helper Functions)
# ====================================================================
import json
import sys
import math


def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)


# ====================================================================
# Body (Write your solution here)
# ====================================================================
def head_specific_masked_attention(q, k, v, mask):
    # 1. Process each attention head independently.
    # 2. Keep only key positions permitted by that head's mask.
    # 3. Apply scaled dot-product attention and stable softmax.
    # 4. Return outputs in the original head-separated structure.
    pass


# ====================================================================
# Tail (Prewritten Input Reader & Output Printer)
# ====================================================================
data = json.loads(sys.stdin.read().strip())
result = head_specific_masked_attention(
    data["q"],
    data["k"],
    data["v"],
    data["mask"]
)
print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    headerCode: `import json
import sys
import math

def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)
`,
    tailCode: `data = json.loads(sys.stdin.read().strip())
result = head_specific_masked_attention(
    data["q"],
    data["k"],
    data["v"],
    data["mask"]
)
print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    solutionCode: `# ====================================================================
# Header (Prewritten Imports & Helper Functions)
# ====================================================================
import json
import sys
import math


def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)


# ====================================================================
# Body (Write your solution here)
# ====================================================================
def head_specific_masked_attention(q, k, v, mask):
    num_heads = len(q)
    sequence_length = len(q[0])
    head_dim = len(q[0][0])
    result = []
    
    for h in range(num_heads):
        head_output = []
        for i in range(sequence_length):
            permitted = []
            scores = []
            for j in range(sequence_length):
                if mask[h][i][j] == 1:
                    dot_product = 0.0
                    for d in range(head_dim):
                        dot_product += q[h][i][d] * k[h][j][d]
                    permitted.append(j)
                    scores.append(dot_product / math.sqrt(head_dim))
            
            maximum = max(scores)
            exponentials = []
            for score in scores:
                exponentials.append(math.exp(score - maximum))
            total = sum(exponentials)
            weights = []
            for value in exponentials:
                weights.append(value / total)
                
            output_vector = []
            for d in range(head_dim):
                value = 0.0
                for index in range(len(permitted)):
                    j = permitted[index]
                    value += weights[index] * v[h][j][d]
                output_vector.append(value)
            head_output.append(output_vector)
        result.append(head_output)
    return result


# ====================================================================
# Tail (Prewritten Input Reader & Output Printer)
# ====================================================================
data = json.loads(sys.stdin.read().strip())
result = head_specific_masked_attention(
    data["q"],
    data["k"],
    data["v"],
    data["mask"]
)
print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    testCases: [
      {
        id: "tc1",
        name: "Sample 1: Single Head 2x2",
        input: {
          q: [[[1.0, 0.0], [0.0, 1.0]]],
          k: [[[1.0, 0.0], [0.0, 1.0]]],
          v: [[[2.0, 3.0], [4.0, 5.0]]],
          mask: [[[1, 0], [1, 1]]]
        },
        expectedOutput: [
          [
            [2.0, 3.0],
            [3.339523, 4.339523]
          ]
        ],
        isSample: true
      },
      {
        id: "tc2",
        name: "Sample 2: Dual Head 2-token sequence",
        input: {
          q: [
            [[1.0, 1.0], [2.0, 0.0]],
            [[0.5, 0.5], [1.0, -1.0]]
          ],
          k: [
            [[1.0, 1.0], [0.0, 2.0]],
            [[1.0, 0.0], [0.0, 1.0]]
          ],
          v: [
            [[1.0, 0.0], [0.0, 1.0]],
            [[2.0, 2.0], [1.0, 3.0]]
          ],
          mask: [
            [[1, 1], [1, 0]],
            [[1, 0], [0, 1]]
          ]
        },
        expectedOutput: [
          [
            [0.5, 0.5],
            [1.0, 0.0]
          ],
          [
            [2.0, 2.0],
            [1.0, 3.0]
          ]
        ],
        isSample: true
      },
      {
        id: "tc3",
        name: "Test 3: Full Attention (All 1s mask)",
        input: {
          q: [[[1.0, 2.0], [3.0, 4.0]]],
          k: [[[1.0, 2.0], [3.0, 4.0]]],
          v: [[[10.0, 20.0], [30.0, 40.0]]],
          mask: [[[1, 1], [1, 1]]]
        },
        expectedOutput: [
          [
            [29.986634, 39.986634],
            [30.0, 40.0]
          ]
        ],
        isSample: false
      }
    ]
  },
  {
    id: "q2",
    number: 4,
    title: "Scaled Positional Input Embeddings",
    category: "Transformer Embeddings",
    difficulty: "Easy",
    tags: ["Embedding", "Positional Encoding", "Scaling", "Vector Math"],
    hints: [
      "1. Determine d_model from the embedding width: d_model = len(embeddings[0]).",
      "2. Calculate scale factor: scale = math.sqrt(d_model).",
      "3. For every position i and feature j: output[i][j] = embeddings[i][j] * scale + positional_encoding[i][j]."
    ],
    description: `A Transformer input stage scales token embeddings before positional information is added to them.

You are given:

* \`embeddings\`: token embeddings of shape \`sequence_length x d_model\`
* \`positional_encoding\`: positional values having the same shape

First determine \`d_model\` from the embedding width and calculate:

\`scale = sqrt(d_model)\`

For every position \`i\` and feature \`j\`, calculate:

\`output[i][j] = embeddings[i][j] * scale + positional_encoding[i][j]\`

Return a matrix having the same shape as the input embeddings. Do not use NumPy or another external numerical library.`,
    functionName: "scaled_positional_input",
    starterCode: `# ====================================================================
# Header (Prewritten Imports & Helper Functions)
# ====================================================================
import json
import sys
import math


def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)


# ====================================================================
# Body (Write your solution here)
# ====================================================================
def scaled_positional_input(embeddings, positional_encoding):
    # 1. Determine d_model from the embedding width.
    # 2. Scale each token feature by sqrt(d_model).
    # 3. Add the matching positional value.
    # 4. Return the transformed embedding matrix.
    pass


# ====================================================================
# Tail (Prewritten Input Reader & Output Printer)
# ====================================================================
data = json.loads(sys.stdin.read().strip())
result = scaled_positional_input(
    data["embeddings"],
    data["positional_encoding"]
)
print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    headerCode: `import json
import sys
import math

def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)
`,
    tailCode: `data = json.loads(sys.stdin.read().strip())
result = scaled_positional_input(
    data["embeddings"],
    data["positional_encoding"]
)
print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    solutionCode: `# ====================================================================
# Header (Prewritten Imports & Helper Functions)
# ====================================================================
import json
import sys
import math


def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)


# Body
def scaled_positional_input(embeddings, positional_encoding):
    d_model = len(embeddings[0])
    scale = math.sqrt(d_model)
    result = []
    
    for i in range(len(embeddings)):
        token = []
        for j in range(d_model):
            token.append(
                embeddings[i][j] * scale
                + positional_encoding[i][j]
            )
        result.append(token)
    return result


# ====================================================================
# Tail (Prewritten Input Reader & Output Printer)
# ====================================================================
data = json.loads(sys.stdin.read().strip())
result = scaled_positional_input(
    data["embeddings"],
    data["positional_encoding"]
)
print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    testCases: [
      {
        id: "tc1",
        name: "Sample 1: 2 Tokens x Dim 4",
        input: {
          embeddings: [
            [1.0, 2.0, 3.0, 4.0],
            [0.5, -1.0, 2.5, -0.5]
          ],
          positional_encoding: [
            [0.1, 0.2, 0.3, 0.4],
            [0.9, 0.8, 0.7, 0.6]
          ]
        },
        expectedOutput: [
          [2.1, 4.2, 6.3, 8.4],
          [1.9, -1.2, 5.7, -0.4]
        ],
        isSample: true
      },
      {
        id: "tc2",
        name: "Sample 2: Single Token, d_model=1",
        input: {
          embeddings: [[3.5]],
          positional_encoding: [[0.5]]
        },
        expectedOutput: [[4.0]],
        isSample: true
      },
      {
        id: "tc3",
        name: "Test 3: 3 Tokens x Dim 9 (Scale = 3.0)",
        input: {
          embeddings: [
            [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
            [0.0, 2.0, 0.0, 2.0, 0.0, 2.0, 0.0, 2.0, 0.0],
            [-1.0, -2.0, -3.0, 1.0, 2.0, 3.0, 0.0, 0.0, 0.0]
          ],
          positional_encoding: [
            [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
            [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
            [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
          ]
        },
        expectedOutput: [
          [3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5],
          [1.0, 7.0, 1.0, 7.0, 1.0, 7.0, 1.0, 7.0, 1.0],
          [-3.0, -6.0, -9.0, 3.0, 6.0, 9.0, 0.0, 0.0, 0.0]
        ],
        isSample: false
      }
    ]
  },
  {
    id: "q3",
    number: 5,
    title: "Multi-Head Cross-Attention",
    category: "Transformer Attention",
    difficulty: "Medium",
    tags: ["Cross-Attention", "Decoder", "Dot Product", "Softmax"],
    hints: [
      "1. For every head and every target query: compute its dot product with every source key in the same head.",
      "2. Divide every score by sqrt(head_dim) and apply a numerically stable softmax across all source positions.",
      "3. Use the probabilities as weights for the corresponding source Value vectors."
    ],
    description: `A Transformer decoder uses multi-head cross-attention in which target queries attend to encoder-side key and value vectors.

The already separated matrices have these forms:
* \`q\`: \`[num_heads][target_length][head_dim]\`
* \`k\`: \`[num_heads][source_length][head_dim]\`
* \`v\`: \`[num_heads][source_length][head_dim]\`

**For every head and every target query:**
1. Compute its dot product with every source key in the same head.
2. Divide every score by \`sqrt(head_dim)\`.
3. Apply a numerically stable softmax across all source positions.
4. Use the probabilities as weights for the corresponding source Value vectors.

Return the result as:
\`[num_heads][target_length][head_dim]\`

Do not concatenate the heads. Do not use NumPy, PyTorch, TensorFlow, or another machine-learning library.`,
    functionName: "multi_head_cross_attention",
    starterCode: `# ====================================================================
# Header (Prewritten Imports & Helper Functions)
# ====================================================================
import json
import sys
import math


def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)


# ====================================================================
# Body (Write your solution here)
# ====================================================================
def multi_head_cross_attention(q, k, v):
    # 1. Process each head independently.
    # 2. Compare every target query with all source keys.
    # 3. Apply scaled dot-product attention and stable softmax.
    # 4. Return weighted source Value vectors for every target position.
    pass


# ====================================================================
# Tail (Prewritten Input Reader & Output Printer)
# ====================================================================
data = json.loads(sys.stdin.read().strip())
result = multi_head_cross_attention(
    data["q"],
    data["k"],
    data["v"]
)
print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    headerCode: `import json
import sys
import math

def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)
`,
    tailCode: `data = json.loads(sys.stdin.read().strip())
result = multi_head_cross_attention(
    data["q"],
    data["k"],
    data["v"]
)
print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    solutionCode: `# ====================================================================
# Header (Prewritten Imports & Helper Functions)
# ====================================================================
import json
import sys
import math


def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)


# ====================================================================
# Body (Write your solution here)
# ====================================================================
def multi_head_cross_attention(q, k, v):
    num_heads = len(q)
    target_length = len(q[0])
    source_length = len(k[0])
    head_dim = len(q[0][0])
    result = []
    
    for h in range(num_heads):
        head_output = []
        for i in range(target_length):
            scores = []
            for j in range(source_length):
                dot_product = 0.0
                for d in range(head_dim):
                    dot_product += q[h][i][d] * k[h][j][d]
                scores.append(dot_product / math.sqrt(head_dim))
            
            maximum = max(scores)
            exponentials = []
            for score in scores:
                exponentials.append(math.exp(score - maximum))
            total = sum(exponentials)
            weights = []
            for value in exponentials:
                weights.append(value / total)
                
            output_vector = []
            for d in range(head_dim):
                value = 0.0
                for j in range(source_length):
                    value += weights[j] * v[h][j][d]
                output_vector.append(value)
            head_output.append(output_vector)
        result.append(head_output)
    return result


# ====================================================================
# Tail (Prewritten Input Reader & Output Printer)
# ====================================================================
data = json.loads(sys.stdin.read().strip())
result = multi_head_cross_attention(
    data["q"],
    data["k"],
    data["v"]
)
print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    testCases: [
      {
        id: "tc1",
        name: "Sample 1: Single Head, Target len 1, Source len 2",
        input: {
          q: [[[1.0, 0.0]]],
          k: [[[1.0, 0.0], [0.0, 1.0]]],
          v: [[[5.0, 6.0], [7.0, 8.0]]]
        },
        expectedOutput: [
          [
            [5.660477, 6.660477]
          ]
        ],
        isSample: true
      },
      {
        id: "tc2",
        name: "Sample 2: 2 Heads, Target len 2, Source len 3",
        input: {
          q: [
            [[1.0, 1.0], [0.0, 2.0]],
            [[2.0, 0.0], [1.0, -1.0]]
          ],
          k: [
            [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]],
            [[0.0, 1.0], [1.0, 0.0], [1.0, 1.0]]
          ],
          v: [
            [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]],
            [[2.0, 3.0], [4.0, 5.0], [6.0, 7.0]]
          ]
        },
        expectedOutput: [
          [
            [0.751745, 0.751745],
            [0.554192, 0.891617]
          ],
          [
            [4.67485, 5.67485],
            [4.287932, 5.287932]
          ]
        ],
        isSample: true
      }
    ]
  },
  {
    id: "q4",
    number: 6,
    title: "Scaled Residual Connection & LayerNorm",
    category: "Transformer Normalization",
    difficulty: "Medium",
    tags: ["Residual Connection", "LayerNorm", "Variance", "Pre-LN"],
    hints: [
      "1. For every token, calculate residual = x + residual_scale * sublayer_output.",
      "2. Apply the supplied layer_norm(residual, gamma, beta, eps) helper.",
      "3. Return all normalized token representations."
    ],
    description: `A Transformer block uses a weighted residual connection before applying layer normalization to each token.

You are given:
* \`x\`: the input token representations
* \`sublayer_output\`: the output from an attention or feed-forward sublayer
* \`residual_scale\`: a scalar applied to the sublayer output
* \`gamma\`: layer-normalization scale parameters
* \`beta\`: layer-normalization shift parameters
* \`eps\`: a small value used for numerical stability

For every token, first calculate:
\`residual = x + residual_scale * sublayer_output\`

Then apply the supplied \`layer_norm()\` helper to the residual vector. Process each token independently and return all normalized token representations.`,
    functionName: "scaled_residual_norm",
    starterCode: `# ====================================================================
# Header (Prewritten Imports & Helper Functions)
# ====================================================================
import json
import sys
import math


def layer_norm(vector, gamma, beta, eps):
    mean = sum(vector) / len(vector)
    variance = 0.0
    for value in vector:
        variance += (value - mean) ** 2
    variance /= len(vector)
    denominator = math.sqrt(variance + eps)
    result = []
    for i in range(len(vector)):
        normalized = (vector[i] - mean) / denominator
        result.append(gamma[i] * normalized + beta[i])
    return result


def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)


# ====================================================================
# Body (Write your solution here)
# ====================================================================
def scaled_residual_norm(
    x,
    sublayer_output,
    residual_scale,
    gamma,
    beta,
    eps
):
    # 1. Scale the sublayer output.
    # 2. Add it to the original token representation.
    # 3. Apply the supplied layer_norm() helper.
    # 4. Return all normalized token vectors.
    pass


# ====================================================================
# Tail (Prewritten Input Reader & Output Printer)
# ====================================================================
data = json.loads(sys.stdin.read().strip())
result = scaled_residual_norm(
    data["x"],
    data["sublayer_output"],
    data["residual_scale"],
    data["gamma"],
    data["beta"],
    data["eps"]
)
print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    headerCode: `import json
import sys
import math

def layer_norm(vector, gamma, beta, eps):
    mean = sum(vector) / len(vector)
    variance = 0.0
    for value in vector:
        variance += (value - mean) ** 2
    variance /= len(vector)
    denominator = math.sqrt(variance + eps)
    result = []
    for i in range(len(vector)):
        normalized = (vector[i] - mean) / denominator
        result.append(gamma[i] * normalized + beta[i])
    return result

def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)
`,
    tailCode: `data = json.loads(sys.stdin.read().strip())
result = scaled_residual_norm(
    data["x"],
    data["sublayer_output"],
    data["residual_scale"],
    data["gamma"],
    data["beta"],
    data["eps"]
)
print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    solutionCode: `# ====================================================================
# Header (Prewritten Imports & Helper Functions)
# ====================================================================
import json
import sys
import math


def layer_norm(vector, gamma, beta, eps):
    mean = sum(vector) / len(vector)
    variance = 0.0
    for value in vector:
        variance += (value - mean) ** 2
    variance /= len(vector)
    denominator = math.sqrt(variance + eps)
    result = []
    for i in range(len(vector)):
        normalized = (vector[i] - mean) / denominator
        result.append(gamma[i] * normalized + beta[i])
    return result


def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)


# ====================================================================
# Body (Write your solution here)
# ====================================================================
def scaled_residual_norm(
    x,
    sublayer_output,
    residual_scale,
    gamma,
    beta,
    eps
):
    result = []
    for i in range(len(x)):
        residual = []
        for j in range(len(x[i])):
            residual.append(
                x[i][j] + residual_scale * sublayer_output[i][j]
            )
        result.append(
            layer_norm(
                residual,
                gamma,
                beta,
                eps
            )
        )
    return result


# ====================================================================
# Tail (Prewritten Input Reader & Output Printer)
# ====================================================================
data = json.loads(sys.stdin.read().strip())
result = scaled_residual_norm(
    data["x"],
    data["sublayer_output"],
    data["residual_scale"],
    data["gamma"],
    data["beta"],
    data["eps"]
)
print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    testCases: [
      {
        id: "tc1",
        name: "Sample 1: Single Token 3-dim",
        input: {
          x: [[1.0, 2.0, 3.0]],
          sublayer_output: [[0.5, 0.5, 0.5]],
          residual_scale: 2.0,
          gamma: [1.0, 1.0, 1.0],
          beta: [0.0, 0.0, 0.0],
          eps: 1e-5
        },
        expectedOutput: [
          [-1.224735, 0.0, 1.224735]
        ],
        isSample: true
      },
      {
        id: "tc2",
        name: "Sample 2: 2 Tokens with non-zero Gamma and Beta",
        input: {
          x: [
            [2.0, 4.0],
            [1.0, 3.0]
          ],
          sublayer_output: [
            [1.0, -1.0],
            [2.0, 0.0]
          ],
          residual_scale: 0.5,
          gamma: [2.0, 0.5],
          beta: [1.0, -1.0],
          eps: 1e-6
        },
        expectedOutput: [
          [-1.0, -0.75],
          [-1.0, -0.75]
        ],
        isSample: true
      }
    ]
  },
  {
    id: "q5",
    number: 7,
    title: "Merge Attention Heads and Project",
    category: "Transformer Architecture",
    difficulty: "Easy",
    tags: ["Concatenation", "Matrix Multiplication", "Projection Layer"],
    hints: [
      "1. For each token position: concatenate the vectors from all heads in increasing head order.",
      "2. Multiply the concatenated vector by wo.",
      "3. Return the projected matrix in the form [sequence_length][output_dim]."
    ],
    description: `After parallel attention heads have been evaluated, a Transformer merges their features and applies an output projection.

You are given:
* \`heads\`: attention outputs of shape \`[num_heads][sequence_length][head_dim]\`
* \`wo\`: an output projection matrix of shape \`d_model x output_dim\`
  where:
  \`d_model = num_heads * head_dim\`

**For each token position:**
1. Concatenate the vectors from all heads in increasing head order.
2. Multiply the concatenated vector by \`wo\`.

Return the projected matrix in the form:
\`[sequence_length][output_dim]\`

Do not use NumPy, PyTorch, TensorFlow, or another external numerical library.`,
    functionName: "merge_heads_and_project",
    starterCode: `# ====================================================================
# Header (Prewritten Imports & Helper Functions)
# ====================================================================
import json
import sys


def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)


# ====================================================================
# Body (Write your solution here)
# ====================================================================
def merge_heads_and_project(heads, wo):
    # 1. Merge head features for each token in head order.
    # 2. Apply the output projection matrix.
    # 3. Return one projected vector per token.
    pass


# ====================================================================
# Tail (Prewritten Input Reader & Output Printer)
# ====================================================================
data = json.loads(sys.stdin.read().strip())
result = merge_heads_and_project(
    data["heads"],
    data["wo"]
)
print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    headerCode: `import json
import sys

def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)
`,
    tailCode: `data = json.loads(sys.stdin.read().strip())
result = merge_heads_and_project(
    data["heads"],
    data["wo"]
)
print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    solutionCode: `# ====================================================================
# Header (Prewritten Imports & Helper Functions)
# ====================================================================
import json
import sys


def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)


# Body
def merge_heads_and_project(heads, wo):
    num_heads = len(heads)
    sequence_length = len(heads[0])
    head_dim = len(heads[0][0])
    output_dim = len(wo[0])
    result = []
    
    for token_index in range(sequence_length):
        merged = []
        for h in range(num_heads):
            for d in range(head_dim):
                merged.append(heads[h][token_index][d])
        projected = []
        for j in range(output_dim):
            value = 0.0
            for i in range(len(merged)):
                value += merged[i] * wo[i][j]
            projected.append(value)
        result.append(projected)
    return result


# ====================================================================
# Tail (Prewritten Input Reader & Output Printer)
# ====================================================================
data = json.loads(sys.stdin.read().strip())
result = merge_heads_and_project(
    data["heads"],
    data["wo"]
)
print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    testCases: [
      {
        id: "tc1",
        name: "Sample 1: 2 Heads, Head dim 2 -> d_model 4 -> Output dim 2",
        input: {
          heads: [
            [[1.0, 2.0], [3.0, 4.0]],
            [[5.0, 6.0], [7.0, 8.0]]
          ],
          wo: [
            [1.0, 0.0],
            [0.0, 1.0],
            [1.0, 1.0],
            [0.0, 0.0]
          ]
        },
        expectedOutput: [
          [6.0, 7.0],
          [10.0, 11.0]
        ],
        isSample: true
      },
      {
        id: "tc2",
        name: "Sample 2: Single Head Identity Projection",
        input: {
          heads: [
            [[1.0, 2.0, 3.0]]
          ],
          wo: [
            [1.0, 0.0, 0.0],
            [0.0, 1.0, 0.0],
            [0.0, 0.0, 1.0]
          ]
        },
        expectedOutput: [
          [1.0, 2.0, 3.0]
        ],
        isSample: true
      }
    ]
  },
  {
    id: "q6",
    number: 8,
    title: "Position-Wise Feed-Forward with GELU",
    category: "Transformer MLP",
    difficulty: "Medium",
    tags: ["Feed-Forward", "GELU Activation", "Linear Layer", "MLP"],
    hints: [
      "1. Apply linear(token, w1, b1) to compute the intermediate hidden vector.",
      "2. Apply the supplied gelu(v) helper to every hidden value.",
      "3. Apply linear(activated, w2, b2) to produce the final output vector for each token."
    ],
    description: `A Transformer-style position-wise feed-forward sublayer uses GELU activation instead of ReLU while keeping two linear transformations.

**For every token, perform these steps:**
1. Apply the first linear transformation using \`w1\` and \`b1\`.
2. Apply the supplied \`gelu()\` helper to every hidden value.
3. Apply the second linear transformation using \`w2\` and \`b2\`.

The required operation is:
\`hidden = GELU(token x W1 + b1)\`
\`output = hidden x W2 + b2\`

The helper functions \`linear()\` and \`gelu()\` are already provided. Apply the same transformation independently to every token in \`x\` and return all output vectors.

Do not use NumPy, PyTorch, TensorFlow, or another external library.`,
    functionName: "gelu_feed_forward",
    starterCode: `# ====================================================================
# Header (Prewritten Imports & Helper Functions)
# ====================================================================
import json
import sys
import math


def linear(vector, weight, bias):
    result = []
    for j in range(len(bias)):
        value = bias[j]
        for i in range(len(vector)):
            value += vector[i] * weight[i][j]
        result.append(value)
    return result


def gelu(value):
    return 0.5 * value * (
        1.0 + math.erf(value / math.sqrt(2.0))
    )


def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)


# ====================================================================
# Body (Write your solution here)
# ====================================================================
def gelu_feed_forward(x, w1, b1, w2, b2):
    # 1. Apply the first supplied linear transformation.
    # 2. Apply GELU element-wise to the hidden vector.
    # 3. Apply the second supplied linear transformation.
    # 4. Repeat independently for every token.
    pass


# ====================================================================
# Tail (Prewritten Input Reader & Output Printer)
# ====================================================================
data = json.loads(sys.stdin.read().strip())
result = gelu_feed_forward(
    data["x"],
    data["w1"],
    data["b1"],
    data["w2"],
    data["b2"]
)
print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    headerCode: `import json
import sys
import math

def linear(vector, weight, bias):
    result = []
    for j in range(len(bias)):
        value = bias[j]
        for i in range(len(vector)):
            value += vector[i] * weight[i][j]
        result.append(value)
    return result

def gelu(value):
    return 0.5 * value * (
        1.0 + math.erf(value / math.sqrt(2.0))
    )

def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)
`,
    tailCode: `data = json.loads(sys.stdin.read().strip())
result = gelu_feed_forward(
    data["x"],
    data["w1"],
    data["b1"],
    data["w2"],
    data["b2"]
)
print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    solutionCode: `# ====================================================================
# Header (Prewritten Imports & Helper Functions)
# ====================================================================
import json
import sys
import math


def linear(vector, weight, bias):
    result = []
    for j in range(len(bias)):
        value = bias[j]
        for i in range(len(vector)):
            value += vector[i] * weight[i][j]
        result.append(value)
    return result


def gelu(value):
    return 0.5 * value * (
        1.0 + math.erf(value / math.sqrt(2.0))
    )


def clean_output(value):
    if hasattr(value, "tolist"):
        value = value.tolist()
    if isinstance(value, list):
        return [clean_output(item) for item in value]
    return round(float(value), 6)


# ====================================================================
# Body (Write your solution here)
# ====================================================================
def gelu_feed_forward(x, w1, b1, w2, b2):
    result = []
    for token in x:
        hidden = linear(token, w1, b1)
        activated = []
        for value in hidden:
            activated.append(gelu(value))
        output = linear(activated, w2, b2)
        result.append(output)
    return result


# ====================================================================
# Tail (Prewritten Input Reader & Output Printer)
# ====================================================================
data = json.loads(sys.stdin.read().strip())
result = gelu_feed_forward(
    data["x"],
    data["w1"],
    data["b1"],
    data["w2"],
    data["b2"]
)
print(
    json.dumps(
        clean_output(result),
        separators=(",", ":")
    )
)
`,
    testCases: [
      {
        id: "tc1",
        name: "Sample 1: Dim 2 -> Dim 4 -> Dim 2",
        input: {
          x: [[1.0, -1.0]],
          w1: [
            [1.0, 0.0, -1.0, 0.5],
            [0.0, 1.0, 0.5, -0.5]
          ],
          b1: [0.0, 0.0, 0.0, 0.0],
          w2: [
            [1.0, 0.0],
            [0.0, 1.0],
            [1.0, 1.0],
            [0.5, -0.5]
          ],
          b2: [0.1, -0.1]
        },
        expectedOutput: [
          [1.261806, -0.779538]
        ],
        isSample: true
      },
      {
        id: "tc2",
        name: "Sample 2: Zero Input Vector",
        input: {
          x: [[0.0, 0.0]],
          w1: [[1.0, 2.0], [3.0, 4.0]],
          b1: [0.0, 0.0],
          w2: [[1.0], [1.0]],
          b2: [0.5]
        },
        expectedOutput: [
          [0.5]
        ],
        isSample: true
      }
    ]
  }
];
