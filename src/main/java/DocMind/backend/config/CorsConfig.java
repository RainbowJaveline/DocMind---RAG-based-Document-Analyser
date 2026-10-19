package DocMind.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class CorsConfig implements WebMvcConfigurer {

    private final AppProperties appProperties;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
       String[] allowedOrigin =  appProperties.getCors().getAllowedOrigin().split(",");
       String[] allowedMethod =  appProperties.getCors().getAllowedMethods().split(",");
       String[] allowedHeader =  appProperties.getCors().getAllowedHeaders().split(",");

        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigin)
                .allowedMethods(allowedMethod)
                .allowedHeaders(allowedHeader)
                .allowCredentials(true);
    }
}
