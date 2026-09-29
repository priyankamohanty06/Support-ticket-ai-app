# Support Ticket AutoPilot

A lightweight local web app for triaging support tickets in JavaScript.

## Run locally

Open the index.html file directly in a browser, or serve the folder with a simple local server.

Example:

```bash
python -m http.server 8000
```

Then open http://localhost:8000/ in your browser.

Project Overview
=============================
Support Ticket AutoPilot is an AI-powered customer support ticket triage application designed to streamline service desk operations. The application automatically analyzes incoming support tickets, classifies them into appropriate categories, assigns priority levels, calculates SLA targets, and generates suggested responses for support agents.

The solution helps organizations reduce manual effort, improve ticket handling consistency, accelerate response times, and enhance customer experience through intelligent automation.

**Key Features**
=====================
✅ Ticket Submission
Enter ticket title and detailed description.
Upload supporting documents and evidence.
Accepts PDF, JPG, PNG, XLSX, and DOCX attachments.
Supports multiple file uploads. 
✅ AI-Powered Classification
Automatically detects ticket categories.
Supports categories such as:
Billing
Hardware
Software
Technical
Account
Product
Security
Allows users to provide category hints for improved accuracy.
✅ Intelligent Prioritization
Assigns priority levels.
Determines severity scores.
Calculates SLA deadlines.
Helps agents identify high-impact issues quickly.
✅ Confidence Scoring
Provides transparency into AI decisions through:

Category Confidence
Priority Score
Response Confidence 
✅ AI Response Generation
Generates suggested customer responses that agents can:

Review
Modify
Approve
Escalate if required 
✅ Agent Workflow Simulation
Support agents can perform actions such as:

Accept
Modify
Override
Escalate
This demonstrates a real-world support desk triage workflow.

**User Interface Components**
Ticket Submission Panel
=========================
Captures:

Ticket Title
Ticket Description
Category Hint
File Attachments

Analysis Results Panel Displays:
=====================================

Ticket ID
Category
Priority
Severity
SLA Deadline
Masked Ticket Preview
Confidence Metrics
Alternative Categories
Suggested Response
Decision Factors
Agent Actions 

Architecture
=====================
Customer Ticket
       │
       ▼
Input Validation
       │
       ▼
       
AI Classification Engine
       │
 ┌─────┼─────────┐
 ▼     ▼         ▼
 
Category Priority Severity
       │
       ▼
       
SLA Assignment
       │
       ▼
Response Generation
       │
       ▼
Agent Review & Actions

**Business Benefits**
=====================
Reduces manual ticket triage effort.
Improves ticket classification consistency.
Accelerates customer response times.
Supports SLA compliance.
Enhances agent productivity.
Increases customer satisfaction.
Enables scalable support operations.

Technology Stack
========================
Frontend
HTML5
CSS3
JavaScript
Components
Dynamic forms
File upload handling
Interactive dashboard
AI analysis display cards
Workflow action controls 

Future Enhancements
========================
Integration with ServiceNow
Integration with Jira Service Management
OpenAI/Azure OpenAI powered ticket summarization
Sentiment Analysis
Knowledge Base Recommendations
Automated Ticket Routing
Agent Performance Analytics
Predictive SLA Breach Alerts
Project Outcomes
This project demonstrates how Artificial Intelligence can be used to automate support ticket classification, prioritization, and response generation while maintaining human oversight through agent review workflows. It showcases practical AI adoption in IT Service Management (ITSM) and customer support environments. 

Author
==========
Priyanka Mohanty

AI Engineer | Business Analyst | QA & Data Integration Specialist

Focused on building AI-powered automation solutions that improve operational efficiency, customer experience, and business decision-making.
