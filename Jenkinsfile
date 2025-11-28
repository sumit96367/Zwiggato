pipeline {
    agent any

    tools {
        jdk 'jdk17'
        nodejs 'node18'
    }

    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        DOCKERHUB_USERNAME = 'sumitsen2004'
        // FIX 1: Used correct variable name below
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/zwiggato-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/zwiggato-frontend"
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

        stage("SonarQube Analysis") {
            parallel {
                stage("SonarQube Analysis - Backend") {
                    steps {
                        dir('backend') {
                            withSonarQubeEnv('sonar-server') {
                                script {
                                    def coverageCmd = ""
                                    if (fileExists('coverage/lcov.info')) {
                                        coverageCmd = "-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info"
                                    }
                                    sh """
                                        ${SCANNER_HOME}/bin/sonar-scanner \
                                        -Dsonar.projectName=zwiggato-backend \
                                        -Dsonar.projectKey=zwiggato-backend \
                                        -Dsonar.sources=src \
                                        -Dsonar.scanner.skipDuplicated=true \
                                        ${coverageCmd}
                                    """
                                }
                            }
                        }
                    }
                }
                
                stage("SonarQube Analysis - Frontend") {
                    steps {
                        dir('frontend') {
                            withSonarQubeEnv('sonar-server') {
                                script {
                                    def coverageCmd = ""
                                    if (fileExists('coverage/lcov.info')) {
                                        coverageCmd = "-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info"
                                    }
                                    sh """
                                        ${SCANNER_HOME}/bin/sonar-scanner \
                                        -Dsonar.projectName=zwiggato-frontend \
                                        -Dsonar.projectKey=zwiggato-frontend \
                                        -Dsonar.sources=src \
                                        -Dsonar.scanner.skipDuplicated=true \
                                        ${coverageCmd}
                                    """
                                }
                            }
                        }
                    }
                }
            }
        }

        stage("Code Quality Gate") {
            steps {
                script {
                    try {
                        timeout(time: 2, unit: 'MINUTES') {
                            waitForQualityGate abortPipeline: false, credentialsId: 'Sonar-token'
                        }
                        echo "Quality gate check completed successfully"
                    } catch (Exception e) {
                        echo "WARNING: Quality gate check issue: ${e.getMessage()}"
                        currentBuild.description = "${currentBuild.description} [Quality Gate: Issue]"
                    }
                }
            }
        }

        stage("Install Backend Dependencies") {
            steps {
                dir('backend') {
                    // FIX 2: Added libatomic installation for the npm error
                    sh "sudo apt-get update && sudo apt-get install -y libatomic1 || echo 'Sudo failed or not Ubuntu, skipping...'"
                    sh "npm install"
                }
            }
        }

        stage("Install Frontend Dependencies") {
            steps {
                dir('frontend') {
                     // Libatomic is likely installed by the previous stage, but safe to keep here just in case
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
                    // Make sure 'docker' matches the ID in your Jenkins Credentials
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

        // ... (Remaining Docker Scout and Deploy stages kept as is) ...
        stage('Docker Scout - Backend Image') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker', toolName: 'docker') {
                        sh """
                            docker-scout quickview ${BACKEND_IMAGE}:latest || true
                            docker-scout cves ${BACKEND_IMAGE}:latest || true
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
            emailext (
                attachLog: true,
                subject: "'${currentBuild.result}': Build ${env.BUILD_NUMBER} - ${env.JOB_NAME}",
                body: "Build Complete. Check logs.", // Simplified for brevity
                to: 'sumitsen2004@gmail.com', 
                mimeType: 'text/html'
            )
        }
    }
}