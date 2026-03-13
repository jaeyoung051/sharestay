package com.example.sharestay.securityconfig;

import com.example.sharestay.security.CustomSuccessHandler;
import com.example.sharestay.security.JwtAuthenticationFilter;
import com.example.sharestay.service.BanService;
import com.example.sharestay.service.CustomUserService;
import com.example.sharestay.service.JwtService;
import com.example.sharestay.service.UserDetailsServiceImpl;
import com.example.sharestay.repository.UserRepository;
import java.util.List;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtService jwtService;
    private final ObjectProvider<ClientRegistrationRepository> clientRegistrationRepositoryProvider;
    private final CustomUserService customUserService;
    private final CustomSuccessHandler customSuccessHandler;
    private final BanService banService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SecurityConfig(
            UserDetailsServiceImpl userDetailsService,
            JwtService jwtService,
            ObjectProvider<ClientRegistrationRepository> clientRegistrationRepositoryProvider,
            CustomUserService customUserService,
            CustomSuccessHandler customSuccessHandler,
            BanService banService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.clientRegistrationRepositoryProvider = clientRegistrationRepositoryProvider;
        this.customUserService = customUserService;
        this.customSuccessHandler = customSuccessHandler;
        this.banService = banService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

//    @Bean
//    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
//        return configuration.getAuthenticationManager();
//    }

    // ✅ 로그인에서 사용할 AuthenticationManager를 “직접” 구성
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder auth =
                http.getSharedObject(AuthenticationManagerBuilder.class);

        auth
                .userDetailsService(userDetailsService)  // 우리 UserDetailsServiceImpl
                .passwordEncoder(passwordEncoder);       // BCryptPasswordEncoder

        return auth.build();
    }

//    // 예: SecurityConfig 위쪽이나 별도 @Configuration 클래스에
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
//    }


//    @Bean
//    public DaoAuthenticationProvider daoAuthenticationProvider() {
//        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
//        provider.setUserDetailsService(userDetailsService);
//        provider.setPasswordEncoder(passwordEncoder);
//        return provider;
//    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174"));
        configuration.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        configuration.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Refresh-Token"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

//    @Bean
//    @Order(1)
//    public SecurityFilterChain publicEndpointsFilterChain(HttpSecurity http) throws Exception {
//        http.securityMatcher(
//                        "/api/rooms/**", "/api/map/**", "/uploads/**", "/api/statistics/**",
//                        "/api/login", "/api/signup",
//                        "/login-success",
//                        "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html"
//                )
//                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
//                .csrf(csrf -> csrf.disable())
//                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .formLogin(form -> form.disable())
//                .httpBasic(basic -> basic.disable());
//
//        return http.build();
//    }
//
//    @Bean
//    @Order(2)
//    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
//        // ⚠ JwtAuthenticationFilter 생성자 시그니처랑 반드시 맞추기
//        JwtAuthenticationFilter jwtFilter =
//                new JwtAuthenticationFilter(jwtService, userDetailsService, banService, userRepository);
//
//        http.authorizeHttpRequests(auth -> auth
//                        // 🔹 Swagger & OpenAPI는 항상 허용
//                        .requestMatchers(
//                                "/v3/api-docs",
//                                "/v3/api-docs/**",
//                                "/swagger-ui/**",
//                                "/swagger-ui.html"
//                        ).permitAll()
//                        .requestMatchers(HttpMethod.GET,
//                                "/api/rooms/**",
//                                "/api/map/**",
//                                "/uploads/**",
//                                "/api/statistics/**"
//                        ).permitAll()
//                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
//                        .requestMatchers("/api/login", "/api/signup", "/api/auth/google").permitAll()
//                        .requestMatchers("/login-success", "/oauth2/**").permitAll()
//
//                        .requestMatchers("/api/bans/**").hasRole("ADMIN")
//
//                        .requestMatchers(HttpMethod.POST, "/api/rooms/**").hasAnyRole("HOST", "ADMIN")
//                        .requestMatchers(HttpMethod.PUT, "/api/rooms/**").hasAnyRole("HOST", "ADMIN")
//                        .requestMatchers(HttpMethod.PATCH, "/api/rooms/**").hasAnyRole("HOST", "ADMIN")
//                        .requestMatchers(HttpMethod.DELETE, "/api/rooms/**").hasAnyRole("HOST", "ADMIN")
//                        .requestMatchers(HttpMethod.POST,"/api/favorites/**").authenticated()
//                        .anyRequest().authenticated()
//                )
//                .exceptionHandling(e -> e.authenticationEntryPoint((request, response, authException) -> response.setStatus(401)))
//                .csrf(csrf -> csrf.disable())
//                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//
//                // ✅ JWT 필터는 그대로 유지
//                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
//
//                .oauth2Login(oauth -> oauth
//                        .userInfoEndpoint(userInfo -> userInfo.userService(customUserService))
//                        .successHandler(customSuccessHandler)
//                )
//                .formLogin(form -> form.disable())
//                .httpBasic(basic -> basic.disable());
//
//        return http.build();
//    }

    // ✅ 단일 SecurityFilterChain
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // JWT 필터 생성 (네 JwtAuthenticationFilter 생성자에 맞춰서)
        JwtAuthenticationFilter jwtFilter =
                new JwtAuthenticationFilter(jwtService, userDetailsService, banService, userRepository);

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // 🔹 Swagger / OpenAPI 문서 완전 개방
                        .requestMatchers(
                                "/v3/api-docs",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // 🔹 로그인/회원가입, OAuth 콜백도 개방
                        .requestMatchers(
                                "/api/login",
                                "/api/signup",
                                "/api/auth/google",
                                "/login-success",
                                "/oauth2/**"
                        ).permitAll()

                        // 🔹 방 조회/지도/통계는 GET은 누구나 가능
                        .requestMatchers(HttpMethod.GET,
                                "/api/rooms/**",
                                "/api/map/**",
                                "/uploads/**",
                                "/api/statistics/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/login", "/api/signup", "/api/auth/google").permitAll()
                        .requestMatchers("/login-success", "/oauth2/**").permitAll()

                        // =================== 인증 필요 경로 ===================
                        .requestMatchers(HttpMethod.POST, "/api/rooms/**").hasAnyRole("HOST", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/rooms/**").hasAnyRole("HOST", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/rooms/**").hasAnyRole("HOST", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/rooms/**").hasAnyRole("HOST", "ADMIN")
                        .requestMatchers(HttpMethod.POST,"/api/favorites/**").authenticated()

                        // 🔹 preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 🔹 프로필 조회/수정: 로그인 사용자 모두(GUEST/HOST/ADMIN)
                        .requestMatchers(HttpMethod.GET, "/api/users/**").hasAnyRole("GUEST","HOST","ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").hasAnyRole("GUEST","HOST","ADMIN")

                        // 🔹 Ban API: 관리자만
                        .requestMatchers("/api/bans/**").hasRole("ADMIN")

                        // 🔹 방 등록/수정/삭제: HOST, ADMIN
                        .requestMatchers(HttpMethod.POST,   "/api/rooms/**").hasAnyRole("HOST", "ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/rooms/**").hasAnyRole("HOST", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/api/rooms/**").hasAnyRole("HOST", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/rooms/**").hasAnyRole("HOST", "ADMIN")

                        // 🔹 즐겨찾기: 로그인 필요
                        .requestMatchers(HttpMethod.POST, "/api/favorites/**").authenticated()

                        // 🔹 나머지는 전부 인증 필요
                        .anyRequest().authenticated()
                )

                .exceptionHandling(e -> e.authenticationEntryPoint((request, response, ex) -> {
                    response.setStatus(401);
                }))

                // ✅ JWT 필터 추가 (UsernamePasswordAuthenticationFilter 앞에)
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)

                // ✅ OAuth2 로그인 성공 시 커스텀 핸들러 (쿠키에 토큰 내려주는)
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(userInfo -> userInfo.userService(customUserService))
                        .successHandler(customSuccessHandler)
                )

                // ✅ 폼 로그인, HTTP Basic 사용 안 함
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        return http.build();
    }
}
