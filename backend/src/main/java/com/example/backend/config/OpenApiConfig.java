package com.example.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI openAPI() {
    return new OpenAPI()
        .info(
            new Info()
                .title("AI 영수증 자동 분류 서비스 API")
                .description("캡스톤 디자인 - 영수증 OCR 및 자동 분류 프로젝트 API 문서")
                .version("1.0.0"));
  }
}
