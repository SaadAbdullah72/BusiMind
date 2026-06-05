# Base Research Papers & References

This project is built as an extension and generalization of several key research papers in the domain of AI-Powered Financial/Business Intelligence, Sentiment Analysis, and Agentic Frameworks.

---

## 1. FinAgent: A Multimodal Foundation Agent for Financial Trading
- **Authors**: Haoyang Wang, Yuchen Liu, Wenya Chen, Zihao Wang
- **Paper Link**: [arXiv:2402.18485](https://arxiv.org/abs/2402.18485)
- **Key Concepts**: 
  - **Tool-Augmented Decision-Making**: Augmenting language models with specialized external tools to solve complex tasks.
  - **Reflection & Memory Systems**: Dual-level reflection to learn from history and adapt to changing market patterns.
  - **Extension in Our Project**: While FinAgent is specialized for financial market trading and quantitative assets, our project extends its core agentic philosophy (using tools, reflection, and domain knowledge) to **general-purpose Business Intelligence, Operational Strategy, SWOT Generation, and Strategic Decision Support**.

---

## 2. FinBERT: Financial Sentiment Analysis with Pre-trained Language Models
- **Authors**: Dogu Araci
- **Paper Link**: [arXiv:1908.10063](https://arxiv.org/abs/1908.10063)
- **Key Concepts**:
  - **Domain-Specific Pre-training**: Adapting language models (like BERT) specifically for financial contexts improves sentiment detection accuracy over general models.
  - **Extension in Our Project**: We integrate specialized business and financial sentiment analysis directly into a multi-agent decision support pipeline. Rather than analyzing sentiment in isolation, our agent feeds sentiment signals directly into the strategic recommendation engine to determine operational risk levels and potential ROI.

---

## 3. ReAct: Synergizing Reasoning and Acting in Language Models
- **Authors**: Shunyu Yao, Jeffrey Zhao, Dian Yu, Nan Du, Izhak Shafran, Karthik Narasimhan, Yuan Cao
- **Paper Link**: [arXiv:2210.03629](https://arxiv.org/abs/2210.03629)
- **Key Concepts**:
  - **Synergistic Reasoning & Action**: Prompting LLMs to generate reasoning traces ("thought") and task-specific actions ("actions/tools") in an interleaved manner.
  - **Extension in Our Project**: This is the underlying orchestration paradigm. We use LangChain's ReAct-based tool-calling agent to fetch real-time market news and dynamically decide whether to run sentiment analyses, extract KPIs, or synthesize a final recommendation.
