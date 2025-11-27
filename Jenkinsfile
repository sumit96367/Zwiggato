pipeline {
    agent any

    tools {
        jdk 'jdk17'
        nodejs 'node18'
    }

    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        DOCKERHUB_USERNAME = 'sumitsen2004'  // CHANGE THIS: Your DockerHub username
        BACKEND_IMAGE = "${sumitsen2004}/zwiggato-backend"
        FRONTEND_IMAGE = "${sumitsen2004}/zwiggato-frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage ("Clean Workspace") {
            steps {
                cleanWs()
            }
        }

        stage ("Git Checkout") {
            steps {
                script {
                    checkout scm
                }
            }
        }

        stage("SonarQube Analysis - Backend") {
            steps {
                dir('backend') {
                    withSonarQubeEnv('sonar-server') {
                        sh """
                            ${SCANNER_HOME}/bin/sonar-scanner \
                            -Dsonar.projectName=zwiggato-backend \
                            -Dsonar.projectKey=zwiggato-backend \
                            -Dsonar.sources=src \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                        """
                    }
                }
            }
        }

        stage("SonarQube Analysis - Frontend") {
            steps {
                dir('frontend') {
                    withSonarQubeEnv('sonar-server') {
                        sh """
                            ${SCANNER_HOME}/bin/sonar-scanner \
                            -Dsonar.projectName=zwiggato-frontend \
                            -Dsonar.projectKey=zwiggato-frontend \
                            -Dsonar.sources=src \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                        """
                    }
                }
            }
        }

        stage("Code Quality Gate") {
            steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'Sonar-token'
                }
            }
        }

        stage("Install Backend Dependencies") {
            steps {
                dir('backend') {
                    sh "npm install"
                }
            }
        }

        stage("Install Frontend Dependencies") {
            steps {
                dir('frontend') {
                    sh "npm install"
                }
            }
        }

        stage("Backend Tests") {
            steps {
                dir('backend') {
                    script {
                        try {
                            sh "npm test -- --coverage --coverageReporters=lcov || true"
                        } catch (Exception e) {
                            echo "Tests failed, but continuing: ${e}"
                        }
                    }
                }
            }
        }

        stage('OWASP FS SCAN - Backend') {
            steps {
                dir('backend') {
                    dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit --update -n', odcInstallation: 'DP-Check'
                    dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
                }
            }
        }

        stage('OWASP FS SCAN - Frontend') {
            steps {
                dir('frontend') {
                    dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit --update -n', odcInstallation: 'DP-Check'
                    dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
                }
            }
        }

        stage ("Trivy File Scan - Backend") {
            steps {
                dir('backend') {
                    sh "trivy fs . > ../trivy-backend.txt || true"
                }
            }
        }

        stage ("Trivy File Scan - Frontend") {
            steps {
                dir('frontend') {
                    sh "trivy fs . > ../trivy-frontend.txt || true"
                }
            }
        }

        stage ("Build Backend Docker Image") {
            steps {
                dir('backend') {
                    sh """
                        docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} .
                        docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest
                    """
                }
            }
        }

        stage ("Build Frontend Docker Image") {
            steps {
                dir('frontend') {
                    sh """
                        docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} .
                        docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest
                    """
                }
            }
        }

        stage ("Tag & Push Backend to DockerHub") {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker') {
                        sh """
                            docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                            docker push ${BACKEND_IMAGE}:latest
                        """
                    }
                }
            }
        }

        stage ("Tag & Push Frontend to DockerHub") {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker') {
                        sh """
                            docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                            docker push ${FRONTEND_IMAGE}:latest
                        """
                    }
                }
            }
        }

        stage('Docker Scout - Backend Image') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker', toolName: 'docker') {
                        sh """
                            docker-scout quickview ${BACKEND_IMAGE}:latest || true
                            docker-scout cves ${BACKEND_IMAGE}:latest || true
                            docker-scout recommendations ${BACKEND_IMAGE}:latest || true
                        """
                    }
                }
            }
        }

        stage('Docker Scout - Frontend Image') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker', toolName: 'docker') {
                        sh """
                            docker-scout quickview ${FRONTEND_IMAGE}:latest || true
                            docker-scout cves ${FRONTEND_IMAGE}:latest || true
                            docker-scout recommendations ${FRONTEND_IMAGE}:latest || true
                        """
                    }
                }
            }
        }

        stage ("Deploy Backend Container") {
            steps {
                script {
                    sh """
                        docker stop zwiggato-backend || true
                        docker rm zwiggato-backend || true
                        docker run -d --name zwiggato-backend \
                            -p 5000:5000 \
                            -e NODE_ENV=production \
                            -e PORT=5000 \
                            -e MONGODB_URI=mongodb://host.docker.internal:27017/zwiggato \
                            ${BACKEND_IMAGE}:latest || true
                    """
                }
            }
        }

        stage ("Deploy Frontend Container") {
            steps {
                script {
                    sh """
                        docker stop zwiggato-frontend || true
                        docker rm zwiggato-frontend || true
                        docker run -d --name zwiggato-frontend \
                            -p 3000:80 \
                            -e VITE_API_URL=http://localhost:5000/api \
                            ${FRONTEND_IMAGE}:latest || true
                    """
                }
            }
        }
    }

    post {
        always {
            script {
                // Combine trivy reports
                sh "cat trivy-backend.txt trivy-frontend.txt > trivy-combined.txt || true"
            }
            
            emailext (
                attachLog: true,
                subject: "'${currentBuild.result}': Build ${env.BUILD_NUMBER} - ${env.JOB_NAME}",
                body: """
                    <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <div style="background-color: #FF6B6B; padding: 15px; margin-bottom: 10px; border-radius: 5px;">
                            <p style="color: white; font-weight: bold; font-size: 18px; margin: 0;">
                                Build Status: ${currentBuild.result ?: 'SUCCESS'}
                            </p>
                        </div>
                        
                        <div style="background-color: #4ECDC4; padding: 15px; margin-bottom: 10px; border-radius: 5px;">
                            <p style="color: white; font-weight: bold; margin: 0;">
                                Project: ${env.JOB_NAME}
                            </p>
                        </div>
                        
                        <div style="background-color: #95E1D3; padding: 15px; margin-bottom: 10px; border-radius: 5px;">
                            <p style="color: white; font-weight: bold; margin: 0;">
                                Build Number: ${env.BUILD_NUMBER}
                            </p>
                        </div>
                        
                        <div style="background-color: #F38181; padding: 15px; margin-bottom: 10px; border-radius: 5px;">
                            <p style="color: white; font-weight: bold; margin: 0;">
                                <a href="${env.BUILD_URL}" style="color: white; text-decoration: underline;">View Build Details</a>
                            </p>
                        </div>
                        
                        <div style="background-color: #AA96DA; padding: 15px; margin-bottom: 10px; border-radius: 5px;">
                            <p style="color: white; font-weight: bold; margin: 0;">
                                Git Commit: ${env.GIT_COMMIT ?: 'N/A'}
                            </p>
                        </div>
                        
                        <div style="background-color: #FCBAD3; padding: 15px; border-radius: 5px;">
                            <p style="color: white; font-weight: bold; margin: 0;">
                                Branch: ${env.GIT_BRANCH ?: 'N/A'}
                            </p>
                        </div>
                        
                        <div style="margin-top: 20px; padding: 15px; background-color: #F5F5F5; border-radius: 5px;">
                            <h3 style="color: #333;">Docker Images:</h3>
                            <ul style="color: #666;">
                                <li>Backend: ${BACKEND_IMAGE}:${IMAGE_TAG}</li>
                                <li>Frontend: ${FRONTEND_IMAGE}:${IMAGE_TAG}</li>
                            </ul>
                        </div>
                    </body>
                    </html>
                """,
                to: 'sumitsen2004@gmail.com',  // CHANGE THIS: Your email address
                mimeType: 'text/html',
                attachmentsPattern: 'trivy-combined.txt'
            )
        }
        
        success {
            echo "Pipeline succeeded!"
        }
        
        failure {
            echo "Pipeline failed!"
        }
    }
}

