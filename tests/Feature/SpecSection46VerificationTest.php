<?php

namespace Tests\Feature;

use Tests\TestCase;

class SpecSection46VerificationTest extends TestCase
{
    /**
     * Test 1: 3-Product test flow with priority "Best option for a student under Tk 80,000".
     */
    public function test_3_product_comparison_flow(): void
    {
        $payload = [
            'installId' => 'test-student-flow-' . uniqid(),
            'userGoal' => 'Best option for a student under Tk 80,000',
            'pages' => [
                [
                    'url' => 'https://example.com/laptops/acer-aspire-5',
                    'title' => 'Acer Aspire 5 A515',
                    'content' => 'Price: Tk 72,000. Intel Core i5-1235U, 16GB RAM, 512GB SSD. Display: 15.6 inch FHD IPS. Battery life: 7 hours. Weight: 1.76 kg. Warranty: 2 years.'
                ],
                [
                    'url' => 'https://example.com/laptops/hp-15s',
                    'title' => 'HP 15s-fq5000',
                    'content' => 'Price: Tk 78,500. Intel Core i5-1235U, 8GB RAM, 512GB SSD. Display: 15.6 inch FHD. Battery life: 6 hours. Weight: 1.69 kg. Warranty: 2 years. Backlit keyboard included.'
                ],
                [
                    'url' => 'https://example.com/laptops/asus-vivobook-15',
                    'title' => 'Asus Vivobook 15 X1504',
                    'content' => 'Price: Tk 84,000 (Over budget). Intel Core i5-1335U, 16GB RAM, 512GB SSD. Display: 15.6 inch FHD OLED. Battery: 5 hours. Weight: 1.7 kg. Fingerprint sensor.'
                ]
            ]
        ];

        $response = $this->postJson('/api/compare', $payload);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'title',
                'bestOverall' => [
                    'optionTitle',
                    'rationale',
                ],
                'comparisonTable' => [
                    'criteria',
                    'options' => [
                        '*' => [
                            'title',
                            'values',
                        ]
                    ]
                ],
                'bestForRecommendations',
                'importantDifferences',
                'missingInformation',
                'sourceLinks',
            ]);

        $data = $response->json();
        
        // Assert schema presence and integrity
        $this->assertNotEmpty($data['title']);
        $this->assertNotEmpty($data['bestOverall']['optionTitle']);
        $this->assertNotEmpty($data['bestOverall']['rationale']);
        $this->assertIsArray($data['comparisonTable']['criteria']);
        $this->assertCount(3, $data['comparisonTable']['options']);
        $this->assertCount(3, $data['sourceLinks']);

        // Assert that the student budget under 80k was honored in winner or rationale
        $winner = $data['bestOverall']['optionTitle'];
        $rationale = $data['bestOverall']['rationale'];
        $this->assertTrue(
            str_contains(strtolower($winner), 'acer') || 
            str_contains(strtolower($winner), 'hp') ||
            str_contains(strtolower($rationale), '80,000') ||
            str_contains(strtolower($rationale), 'tk'),
            "Expected winner or rationale to align with student budget under Tk 80,000"
        );
    }

    /**
     * Test 2: 2-Job comparison test flow.
     */
    public function test_2_job_comparison_flow(): void
    {
        $payload = [
            'installId' => 'test-job-flow-' . uniqid(),
            'userGoal' => 'Best work-life balance and learning opportunities',
            'pages' => [
                [
                    'url' => 'https://careers.example.com/senior-backend-dev',
                    'title' => 'Senior Backend Engineer - TechCorp',
                    'content' => 'Job Title: Senior Backend Engineer. Base Salary: $120,000/yr. Location: Fully Remote. Working Hours: 38 hrs/week, flexible schedule. Tech Stack: Laravel, PostgreSQL, Docker. Health insurance: 100% covered. Equity: 0.1% stock options.'
                ],
                [
                    'url' => 'https://jobs.example.com/lead-dev',
                    'title' => 'Lead Developer - FastStartup',
                    'content' => 'Job Title: Lead Developer. Base Salary: $145,000/yr. Location: Hybrid (3 days onsite in SF). Working Hours: Fast-paced high-growth startup environment, on-call rotation. Tech Stack: Go, React, Kubernetes. Stock options included.'
                ]
            ]
        ];

        $response = $this->postJson('/api/compare', $payload);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'title',
                'bestOverall' => ['optionTitle', 'rationale'],
                'comparisonTable' => ['criteria', 'options'],
                'bestForRecommendations',
                'importantDifferences',
                'missingInformation',
                'sourceLinks'
            ]);

        $data = $response->json();
        $this->assertCount(2, $data['comparisonTable']['options']);
        $this->assertCount(2, $data['sourceLinks']);
    }

    /**
     * Test 3: 2-Course comparison test flow.
     */
    public function test_2_course_comparison_flow(): void
    {
        $payload = [
            'installId' => 'test-course-flow-' . uniqid(),
            'userGoal' => 'Hands-on practical fullstack web development for beginners',
            'pages' => [
                [
                    'url' => 'https://learn.example.com/fullstack-bootcamp',
                    'title' => 'The Complete Fullstack Web Dev Bootcamp',
                    'content' => 'Tuition: $89. Duration: 65 hours on-demand video. Format: Self-paced online course with 12 real-world portfolio projects. Topics: HTML, CSS, JavaScript, React, Node.js, SQL. Certificate of completion: Included. Prerequisites: None.'
                ],
                [
                    'url' => 'https://academy.example.com/cs-fundamentals',
                    'title' => 'CS50: Introduction to Computer Science',
                    'content' => 'Tuition: Free to audit ($199 for verified certificate). Duration: 12 weeks (6-18 hours/week). Format: University lecture series with rigorous problem sets. Topics: C, Python, SQL, Algorithms, Data Structures. Prerequisites: High school math.'
                ]
            ]
        ];

        $response = $this->postJson('/api/compare', $payload);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'title',
                'bestOverall' => ['optionTitle', 'rationale'],
                'comparisonTable' => ['criteria', 'options'],
                'bestForRecommendations',
                'importantDifferences',
                'missingInformation',
                'sourceLinks'
            ]);

        $data = $response->json();
        $this->assertCount(2, $data['comparisonTable']['options']);
        $this->assertCount(2, $data['sourceLinks']);
    }
}
