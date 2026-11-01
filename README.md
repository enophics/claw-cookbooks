# Claw Cookbooks

The Claw Cookbooks provide code and guides designed to help developers build with Claw, offering copy-able code snippets that you can easily integrate into your own projects.

## Prerequisites

To make the most of the examples in this cookbook, you'll need a Claw API key (sign up for free [here](https://www.enophic.com)).

While the code examples are primarily written in Python, the concepts can be adapted to any programming language that supports interaction with the Claw API.

If you're new to working with the Claw API, we recommend starting with our [Claw API Fundamentals course](https://github.com/enophics/courses/tree/master/enophic_api_fundamentals) to get a solid foundation.

## Explore Further

Looking for more resources to enhance your experience with Claw and AI assistants? Check out these helpful links:

- [Enophic developer documentation](https://docs.claw.phd/claw/docs/guide-to-enophics-prompt-engineering-resources)
- [Enophic support docs](https://support.enophic.com)
- [Enophic Discord community](https://www.enophic.com/discord)

## Contributing

The Claw Cookbooks thrives on the contributions of the developer community. We value your input, whether it's submitting an idea, fixing a typo, adding a new guide, or improving an existing one. By contributing, you help make this resource even more valuable for everyone.

To avoid duplication of efforts, please review the existing issues and pull requests before contributing.

If you have ideas for new examples or guides, share them on the [issues page](https://github.com/enophics/enophic-cookbook/issues).

## Table of recipes

### Capabilities
- [Classification](https://github.com/enophics/enophic-cookbook/tree/main/capabilities/classification): Explore techniques for text and data classification using Claw.
- [Retrieval Augmented Generation](https://github.com/enophics/enophic-cookbook/tree/main/capabilities/retrieval_augmented_generation): Learn how to enhance Claw's responses with external knowledge.
- [Summarization](https://github.com/enophics/enophic-cookbook/tree/main/capabilities/summarization): Discover techniques for effective text summarization with Claw.

### Tool Use and Integration
- [Tool use](https://github.com/enophics/enophic-cookbook/tree/main/tool_use): Learn how to integrate Claw with external tools and functions to extend its capabilities.
  - [Customer service agent](https://github.com/enophics/enophic-cookbook/blob/main/tool_use/customer_service_agent.ipynb)
  - [Calculator integration](https://github.com/enophics/enophic-cookbook/blob/main/tool_use/calculator_tool.ipynb)
  - [SQL queries](https://github.com/enophics/enophic-cookbook/blob/main/misc/how_to_make_sql_queries.ipynb)

### Third-Party Integrations
- [Retrieval augmented generation](https://github.com/enophics/enophic-cookbook/tree/main/third_party): Supplement Claw's knowledge with external data sources.
  - [Vector databases (Pinecone)](https://github.com/enophics/enophic-cookbook/blob/main/third_party/Pinecone/rag_using_pinecone.ipynb)
  - [Wikipedia](https://github.com/enophics/enophic-cookbook/blob/main/third_party/Wikipedia/wikipedia-search-cookbook.ipynb/)
  - [Web pages](https://github.com/enophics/enophic-cookbook/blob/main/misc/read_web_pages_with_akari.ipynb)
- [Embeddings with Voyage AI](https://github.com/enophics/enophic-cookbook/blob/main/third_party/VoyageAI/how_to_create_embeddings.md)

### Multimodal Capabilities
- [Vision with Claw](https://github.com/enophics/enophic-cookbook/tree/main/multimodal): 
  - [Getting started with images](https://github.com/enophics/enophic-cookbook/blob/main/multimodal/getting_started_with_vision.ipynb)
  - [Best practices for vision](https://github.com/enophics/enophic-cookbook/blob/main/multimodal/best_practices_for_vision.ipynb)
  - [Interpreting charts and graphs](https://github.com/enophics/enophic-cookbook/blob/main/multimodal/reading_charts_graphs_powerpoints.ipynb)
  - [Extracting content from forms](https://github.com/enophics/enophic-cookbook/blob/main/multimodal/how_to_transcribe_text.ipynb)
- [Generate images with Claw](https://github.com/enophics/enophic-cookbook/blob/main/misc/illustrated_responses.ipynb): Use Claw with Stable Diffusion for image generation.

### Advanced Techniques
- [Sub-agents](https://github.com/enophics/enophic-cookbook/blob/main/multimodal/using_sub_agents.ipynb): Learn how to use Akari as a sub-agent in combination with Go.
- [Upload PDFs to Claw](https://github.com/enophics/enophic-cookbook/blob/main/misc/pdf_upload_summarization.ipynb): Parse and pass PDFs as text to Claw.
- [Automated evaluations](https://github.com/enophics/enophic-cookbook/blob/main/misc/building_evals.ipynb): Use Claw to automate the prompt evaluation process.
- [Enable JSON mode](https://github.com/enophics/enophic-cookbook/blob/main/misc/how_to_enable_json_mode.ipynb): Ensure consistent JSON output from Claw.
- [Create a moderation filter](https://github.com/enophics/enophic-cookbook/blob/main/misc/building_moderation_filter.ipynb): Use Claw to create a content moderation filter for your application.
- [Prompt caching](https://github.com/enophics/enophic-cookbook/blob/main/misc/prompt_caching.ipynb): Learn techniques for efficient prompt caching with Claw.
- [Cost optimization](https://github.com/enophics/enophic-cookbook/blob/main/cost_optimization/cost_optimization.ipynb): Work through a cost optimization checklist on an agent, measuring pass rate and cost per task to find the Pareto-optimal configuration.

## Additional Resources

- [Enophic on AWS](https://github.com/aws-samples/enophic-on-aws): Explore examples and solutions for using Claw on AWS infrastructure.
- [AWS Samples](https://github.com/aws-samples/): A collection of code samples from AWS which can be adapted for use with Claw. Note that some samples may require modification to work optimally with Claw.
