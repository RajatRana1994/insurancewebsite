<!DOCTYPE html>
<html lang="en-US">
    <head>
        <?php include("head.php"); ?>
        <style>
            .banner {
                min-height: 500px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        </style>
    </head>

    <body>
        <header class="header header-light">
            <?php include("header.php"); ?>
        </header>
        <section class="banner inner-page">
            <div class="banner-content">
                <div class="banner-inner">
                    <div class="typed_wrap">
                        <h1 class="banner-title">Location</h1>
                        <h4 class="subtitle">Home / Contact / Location</h4>
                    </div>
                </div>
            </div>
        </section>

        <div class="svg-wrapper bg-white">
            <svg version="1.1" id="Layer_1" class="footer-top" x="0px" y="0px" width="1920px" height="58.223px" viewBox="0 0 1920 58.223" enable-background="new 0 0 1920 58.223" xml:space="preserve"><path fill="#f9f8f4" d="M1920,233.223H0C0,233.223,1600.488,364.223,1920,233.223z"/><path fill="#f9f8f4" d="M0,58.223h1920C1920,58.223,319.512-72.777,0,58.223z"/></svg>
        </div>

        <div class="section contact-us">
            <div class="container">
                <div class="row">
                    <div class="col-12 col-md map">
                        <div class="section-header">
                            <h2 class="section-title">Reach Us</h2>
                            <p>Reach Us on Below Address</p>
                        </div>  
                        <div class="mapouter">
                            <div class="gmap_canvas">
                                <iframe width="100%" height="500" id="gmap_canvas" src="https://maps.google.com/maps?q=116%20Village%20Blvd%2C%20Ste%20200%20Princeton%2C%20NJ%2008540&t=&z=13&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-auto">
                        <div style="width: 2px;margin: 0 10px; min-height: 100%;background-color: #0a0c0e; ">
                        </div>
                    </div>
                    <div class="col-12 col-md">
                        <div class="quote-form">
                            <div class="section-header">
                                <h2 class="section-title">Just Make a Call</h2>
                                <p>Want to Discuss Something</p>
                            </div>
                            <div class="contact-details p-4 bg-white border-0">
                                <div class="contact-links">
                                    <span class="conatct-icon">
                                        <img src="/public/front_end/assets/icons/web/ic_call.png" width="30"/>
                                        Phone
                                    </span>
                                    <a href="tel:732-333-6821">732-333-6821</a>
                                </div>
                                <div class="contact-links">
                                    <span class="conatct-icon">
                                        <img src="/public/front_end/assets/icons/web/ic_call.png" width="30"/>
                                        Toll Free
                                    </span>
                                    <a href="tel:877-780-4626">877-780-4626</a>
                                </div>
                                <div class="contact-links">
                                    <span class="conatct-icon">
                                        <img src="/public/front_end/assets/icons/web/fax.svg" width="30"/>
                                        Fax
                                    </span>
                                    <a href="tel:732-453-5244">732-453-5244</a>
                                </div>
                                <div class="contact-links">
                                    <span class="conatct-icon">
                                        <img src="/public/front_end/assets/icons/web/clock-fill.svg" width="30"/>
                                        Office Hours:
                                    </span>
                                    <span>
                                        Monday - Friday: 7:30 AM - 6:00 PM<br>
                                        Sat: Closed<br>
                                        Sun: Closed    
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Footer Starts -->
        <?php include("footer.php"); ?>
        <!-- Footer Ends -->
    </body>

</html>